import { cn } from "@/lib/utils";

const PALETTE = [
  "#6750E3", // violet
  "#FF6F59", // coral
  "#1E8E6B", // emerald
  "#C77D2E", // amber
  "#2E7DC7", // blue
  "#A347C7", // purple
  "#D4A017", // gold
  "#5B8C8C", // teal
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-24 w-24 text-2xl",
};

/**
 * Initials-only avatar. InkFlow deliberately has no profile picture
 * uploads — every person is represented by their initials on a
 * deterministic color derived from their name, so the same person
 * always renders identically across the app.
 */
export function InitialsAvatar({
  name,
  size = "md",
  className,
  ringClassName,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
  ringClassName?: string;
}) {
  const bg = colorForName(name || "?");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none",
        SIZES[size],
        ringClassName,
        className
      )}
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      {initialsFor(name || "?")}
    </span>
  );
}
