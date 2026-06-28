import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-24 w-full rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-text-primary placeholder:text-text-tertiary transition-all duration-200 outline-none resize-none",
      "focus:border-accent-violet focus:ring-4 focus:ring-accent-violet/10",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
