"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertTriangle, AlertOctagon, Loader2, Sparkles, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info" | "loading";

export interface ToastItem {
  id?: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: ToastItem | null;
  showToast: (item: ToastItem | string, type?: ToastType, title?: string) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: null,
  showToast: () => {},
  hideToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback(
    (item: ToastItem | string, type: ToastType = "success", title?: string) => {
      if (typeof item === "string") {
        setToast({
          id: Date.now().toString(),
          message: item,
          type,
          title,
          duration: type === "loading" ? 0 : 4000,
        });
      } else {
        setToast({
          id: item.id || Date.now().toString(),
          message: item.message,
          title: item.title,
          type: item.type || "success",
          duration: item.duration ?? 4000,
        });
      }
    },
    []
  );

  useEffect(() => {
    if (!toast || (toast.duration && toast.duration <= 0)) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
      <DynamicIslandToast toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function DynamicIslandToast({
  toast,
  onClose,
}: {
  toast: ToastItem | null;
  onClose: () => void;
}) {
  if (!toast) return null;

  const type = toast.type || "success";

  return (
    <aside
      aria-label="Notification"
      className="fixed top-3.5 sm:top-5 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none flex justify-center w-full px-4"
    >
      <div
        className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-zinc-950/95 dark:bg-black/95 text-white border border-zinc-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_20px_rgba(245,158,11,0.12)] ring-1 ring-white/10 backdrop-blur-2xl transition-all duration-300 animate-in fade-in zoom-in-95 slide-in-from-top-3 max-w-[94vw] sm:max-w-lg min-w-[260px] select-none"
      >
        {/* Glow pill icon */}
        <div className="shrink-0 flex items-center justify-center">
          {type === "success" && (
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xs shadow-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          )}
          {type === "warning" && (
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shadow-xs shadow-amber-500/40">
              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          )}
          {type === "error" && (
            <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-xs shadow-rose-500/40">
              <AlertOctagon className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          )}
          {type === "loading" && (
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          )}
          {type === "info" && (
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          {toast.title && (
            <div className="text-xs sm:text-sm font-bold text-white tracking-tight leading-tight truncate">
              {toast.title}
            </div>
          )}
          <div className="text-[11px] sm:text-xs text-zinc-300 font-mono leading-tight truncate">
            {toast.message}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="shrink-0 w-5 h-5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
}

export default DynamicIslandToast;
