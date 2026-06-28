import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IBookmark extends Document {
  user: Types.ObjectId;
  blog: Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

bookmarkSchema.index({ user: 1, blog: 1 }, { unique: true });

export const Bookmark: Model<IBookmark> = mongoose.models.Bookmark || mongoose.model<IBookmark>("Bookmark", bookmarkSchema);
