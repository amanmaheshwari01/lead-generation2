import { NextResponse } from 'next/server';

/**
 * Next.js Proxy to handle BOTH route protection and silent authentication refresh.
 * This ensures that even if an accessToken is deleted/expired, the page stays alive.
 */
export default async function proxy(request) {
    const { pathname } = request.nextUrl;

    // 1. Skip proxy for static assets, public files, and API routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api') ||
        pathname === '/' // Login page
    ) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // 2. Clear redirect to login if NO session exists at all
    if (!accessToken && !refreshToken) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // 3. SERVER-SIDE SILENT REFRESH
    // If the accessToken is missing (expired/deleted) but refreshToken exists,
    // we perform a refresh call right here before the page is even rendered.
    if (!accessToken && refreshToken) {
        try {
            // Note: Proxy runs in Edge Runtime, so we must use absolute URLs for fetch
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
            
            const refreshRes = await fetch(`${apiUrl}/user/refresh`, {
                method: 'POST',
                headers: {
                    'Cookie': `refreshToken=${refreshToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (refreshRes.ok) {
                // The backend has sent NEW Set-Cookie headers in the refreshRes
                const response = NextResponse.next();
                
                // Properly retrieve all Set-Cookie headers (handles multiple cookies correctly)
                const setCookieHeaders = refreshRes.headers.getSetCookie();
                
                if (setCookieHeaders && setCookieHeaders.length > 0) {
                    setCookieHeaders.forEach(cookie => {
                        response.headers.append('set-cookie', cookie);
                    });
                    console.log('[PROXY] Access token refreshed and cookies propagated');
                }
                
                return response;
            }
        } catch (error) {
            console.error('[PROXY] Refresh failed:', error.message);
        }

        // If refresh failed (token invalid or backend down), redirect back to login
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/employee/:path*', '/profile/:path*'],
};
