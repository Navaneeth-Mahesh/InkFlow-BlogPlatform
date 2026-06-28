"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Category } from "@/types";

export function CategoryPills({
  categories,
  active,
  onChange,
}: {
  categories: Category[];
  active: string | null;
  onChange: (slug: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      <PillButton active={active === null} onClick={() => onChange(null)}>All</PillButton>
      {categories.map((c) => (
        <PillButton key={c.id} active={active === c.slug} onClick={() => onChange(c.slug)} dotColor={c.color}>
          {c.name}
        </PillButton>
      ))}
    </div>
  );
}

function PillButton({
  children,
  active,
  onClick,
  dotColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors whitespace-nowrap border",
        active ? "text-text-on-accent border-transparent" : "text-text-secondary border-border hover:border-border-strong hover:text-text-primary"
      )}
    >
      {active && (
        <motion.span layoutId="active-pill" className="absolute inset-0 rounded-full bg-accent-violet" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {dotColor && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: active ? "white" : dotColor }} />}
        {children}
      </span>
    </button>
  );
}
