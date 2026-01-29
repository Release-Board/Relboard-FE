"use client";

import { useCallback } from "react";
import { useToastStore } from "@/lib/store/toastStore";

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `toast_${Math.random().toString(36).slice(2, 10)}`;
}

type ToastTone = "success" | "error" | "info";

type ToastOptions = {
  tone?: ToastTone;
  duration?: number;
};

export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  const removeToast = useToastStore((state) => state.removeToast);

  return useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = createId();
      const tone = options.tone ?? "info";
      const duration = options.duration ?? 2400;

      addToast({ id, message, tone });

      window.setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [addToast, removeToast]
  );
}
