"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import ClientPortal from "./clientPortal";

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  return (
    <ClientPortal selector="body">
      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-theme-navy/40 backdrop-blur-md"
          />

          {/* Modal Panel */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-theme-navy/30 border border-white/40"
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-theme-error/10 text-theme-error rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-theme-error/5">
                <AlertTriangle size={32} />
              </div>
              
              <h3 className="text-xl font-black text-theme-navy mb-2 tracking-tight">
                {title || "Confirm Removal"}
              </h3>
              
              <p className="text-theme-slate text-sm font-medium mb-8 leading-relaxed opacity-80 px-2">
                {message || "This action is permanent and cannot be reversed. Are you sure?"}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 px-6 rounded-2xl border-2 border-theme-navy/5 text-theme-slate font-black text-xs uppercase tracking-widest hover:bg-theme-navy/5 hover:border-theme-navy/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 py-4 px-6 rounded-2xl bg-theme-error text-white font-black text-xs uppercase tracking-widest hover:bg-theme-error/90 shadow-xl shadow-theme-error/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </ClientPortal>
  );
}
