import { NextResponse } from 'next/server';

/**
 * Next.js Middleware to handle BOTH route protection and silent authentication refresh.
 * This ensures that even if an accessToken is deleted/expired, the page stays alive.
 */
export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // 1. Skip middleware for static assets, public files, and API routes
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
            // Note: Middleware runs in Edge Runtime, so we must use absolute URLs for fetch
            // We use the same backend port as defined in your local setup
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
                
                // Copy the new cookies (accessToken especially) to the middleware's response
                // This ensures the browser receives the new cookie AND the page gets rendered with it.
                const setCookieHeader = refreshRes.headers.get('set-cookie');
                if (setCookieHeader) {
                    response.headers.set('set-cookie', setCookieHeader);
                }
                
                return response;
            }
        } catch (error) {
            console.error('[MIDDLEWARE] Refresh failed:', error.message);
        }

        // If refresh failed (token invalid or backend down), redirect back to login
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/employee/:path*', '/profile/:path*'],
};
