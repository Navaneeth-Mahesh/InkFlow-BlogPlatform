import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IBlog extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: Types.ObjectId;
  tags: string[];
  author: Types.ObjectId;
  status: "published" | "draft";
  views: number;
  likes: Types.ObjectId[];
  bookmarksCount: number;
  commentsCount: number;
  readTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: [160, "Title cannot exceed 160 characters"] },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, default: "", maxlength: [220, "Excerpt cannot exceed 220 characters"] },
    content: { type: String, required: [true, "Content is required"] },
    coverImage: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: [true, "Category is required"] },
    tags: [{ type: String, trim: true, lowercase: true }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["published", "draft"], default: "draft" },
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    bookmarksCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    readTime: { type: Number, default: 1 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

blogSchema.index({ title: "text", excerpt: "text", tags: "text" });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ views: -1 });
blogSchema.index({ likes: 1 });

blogSchema.virtual("likesCount").get(function (this: IBlog) {
  return this.likes?.length ?? 0;
});

blogSchema.set("toJSON", { virtuals: true });
blogSchema.set("toObject", { virtuals: true });

export const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);
