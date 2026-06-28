"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useToasts } from "@/hooks/use-toast";

const ICONS = { success: CheckCircle2, error: XCircle, default: Info };
const ICON_COLORS = {
  success: "text-accent-emerald",
  error: "text-accent-coral",
  default: "text-accent-violet",
};

export function Toaster() {
  const { toasts, dismiss } = useToasts();

  return (
    <div
      className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full sm:max-w-[380px] pointer-events-none"
      role="region"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant ?? "default"];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, transition: { duration: 0.2, ease: "easeIn" } }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-token-lg)]"
            >
              <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${ICON_COLORS[t.variant ?? "default"]}`} />
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="text-sm font-semibold text-text-primary leading-snug">{t.title}</p>
                )}
                {t.description && (
                  <p className="text-[13px] text-text-secondary mt-0.5 leading-snug">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-full p-1 text-text-tertiary hover:text-text-primary hover:bg-surface-sunken transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
