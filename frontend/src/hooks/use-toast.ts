"use client";

import * as React from "react";

export type ToastVariant = "default" | "success" | "error";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
// One real setTimeout handle per toast id. Tracking these explicitly (rather
// than relying on a CSS animation's animationend event, which silently never
// fires if the element unmounts/remounts or a transition is interrupted) is
// what actually guarantees every toast gets removed.
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((l) => l([...toasts]));
}

function clearTimer(id: string) {
  const handle = timers.get(id);
  if (handle) {
    clearTimeout(handle);
    timers.delete(id);
  }
}

export function dismissToast(id: string) {
  clearTimer(id);
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function toast(input: {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const duration = input.duration ?? 4000;

  toasts = [{ id, duration, ...input }, ...toasts].slice(0, 4);
  emit();

  const handle = setTimeout(() => dismissToast(id), duration);
  timers.set(id, handle);

  return id;
}

export function useToasts() {
  const [state, setState] = React.useState<ToastItem[]>(() => [...toasts]);

  React.useEffect(() => {
    listeners.add(setState);
    return () => {
      listeners.delete(setState);
    };
  }, []);

  return { toasts: state, dismiss: dismissToast };
}
