import slugify from "slugify";
import { Model } from "mongoose";

export function toSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

export async function generateUniqueSlug(model: Model<any>, title: string, excludeId?: string): Promise<string> {
  const base = toSlug(title) || "untitled";
  let slug = base;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await model.exists(query);
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
