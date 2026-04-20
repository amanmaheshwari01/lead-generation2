"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-theme-navy/20 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="glass-panel w-full max-w-sm rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-theme-error/10 text-theme-error rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h3 className="text-xl font-bold text-theme-navy mb-2">{title || "Confirm Deletion"}</h3>
          <p className="text-theme-slate text-sm mb-8 leading-relaxed">
            {message || "Are you sure you want to delete this item? This action cannot be undone."}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-2xl border border-theme-slate/20 text-theme-slate font-bold text-sm hover:bg-theme-slate/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-3 px-6 rounded-2xl bg-theme-error text-white font-bold text-sm hover:bg-theme-error/90 hover:shadow-lg hover:shadow-theme-error/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
