"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const SheetContext = React.createContext({ open: false, setOpen: () => {} });

export function Sheet({ children, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, asChild }) {
  const { setOpen } = React.useContext(SheetContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    });
  }
  
  return <button onClick={() => setOpen(true)}>{children}</button>;
}

export function SheetContent({ children, className }) {
  const { open, setOpen } = React.useContext(SheetContext);

  // Close on escape key
  React.useEffect(() => {
    if (!open) return;
    const handleUp = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keyup", handleUp);
    return () => window.removeEventListener("keyup", handleUp);
  }, [open, setOpen]);

  // Lock scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] bg-theme-navy/40 backdrop-blur-sm"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed inset-y-0 right-0 z-[101] h-full w-[85%] sm:max-w-sm border-l border-white/20 bg-white shadow-2xl flex flex-col",
              className
            )}
          >
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-theme-slate/40 hover:bg-theme-light hover:text-theme-navy transition-all active:scale-95"
            >
              <X size={20} />
            </button>
            
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function SheetHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-2 p-6 pb-2", className)}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-2xl font-black text-theme-navy tracking-tight", className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }) {
  return (
    <p
      className={cn("text-sm font-bold text-theme-slate/60", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-3 p-6 border-t border-theme-slate/5", className)}
      {...props}
    />
  );
}
