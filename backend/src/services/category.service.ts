import { Category, ICategory } from "../models";
import { toSlug } from "../utils/slug";

// Cycled deterministically by name so the same new category name always
// gets the same color, without needing the user to pick one.
const COLOR_PALETTE = [
  "#6750E3", // violet
  "#E35D6A", // coral-red
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
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

/**
 * Resolves a user-typed category name to a Category document, creating it
 * if it doesn't already exist (case-insensitively matched on name/slug so
 * "Technology" and "technology" reuse the same category instead of
 * duplicating it).
 */
export async function findOrCreateCategory(rawName: string): Promise<ICategory> {
  const name = rawName.trim();
  const slug = toSlug(name) || "general";

  const existing = await Category.findOne({
    $or: [{ slug }, { name: new RegExp(`^${escapeRegex(name)}$`, "i") }],
  });
  if (existing) return existing;

  return Category.create({ name, slug, color: colorForName(name) });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
