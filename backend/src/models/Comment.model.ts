import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IComment extends Document {
  _id: Types.ObjectId;
  blog: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  parentComment: Types.ObjectId | null;
  likes: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    blog: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: [true, "Comment content is required"], trim: true, maxlength: [2000, "Comment cannot exceed 2000 characters"] },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

commentSchema.index({ blog: 1, parentComment: 1, createdAt: -1 });

export const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);
