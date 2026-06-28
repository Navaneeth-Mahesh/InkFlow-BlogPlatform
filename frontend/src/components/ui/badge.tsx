import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full font-medium transition-colors", {
  variants: {
    variant: {
      default: "bg-surface-sunken text-text-secondary border border-border",
      accent: "bg-accent-violet/10 text-accent-violet",
      coral: "bg-accent-coral/10 text-accent-coral",
      outline: "border border-border-strong text-text-primary bg-transparent",
      solid: "bg-text-primary text-bg",
    },
    size: {
      sm: "text-[11px] px-2.5 py-1",
      md: "text-[13px] px-3 py-1.5",
    },
  },
  defaultVariants: { variant: "default", size: "sm" },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

function Badge({ className, variant, size, dotColor, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dotColor && <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
