"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  iconOnly = false,
  animated = true,
}: {
  className?: string;
  iconOnly?: boolean;
  animated?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 group focus-visible:outline-none", className)} aria-label="InkFlow home">
      <span className="relative h-8 w-8 shrink-0">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
          <motion.path
            d="M6 24C6 24 9.5 12 14 9C17.5 6.7 19 10 17 13C14.5 16.7 9 17 9 17C9 17 14.5 17.3 19 14.5C23 12 24 8 24 8"
            stroke="var(--accent-violet)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
            animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
            transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}
            className="group-hover:[stroke:var(--accent-coral)] transition-colors duration-300"
          />
          <motion.circle
            cx="24"
            cy="8"
            r="2"
            fill="var(--accent-coral)"
            initial={animated ? { scale: 0, opacity: 0 } : undefined}
            animate={animated ? { scale: 1, opacity: 1 } : undefined}
            transition={{ delay: 0.9, duration: 0.4, ease: "backOut" }}
          />
        </svg>
      </span>
      {!iconOnly && (
        <span className="font-display text-[1.35rem] font-semibold tracking-tight text-text-primary">
          Ink<span className="text-accent-violet">Flow</span>
        </span>
      )}
    </Link>
  );
}
