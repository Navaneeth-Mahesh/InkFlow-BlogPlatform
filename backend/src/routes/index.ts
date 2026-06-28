import { Router } from "express";
import authRoutes from "./auth.routes";
import blogRoutes from "./blog.routes";
import commentRoutes from "./comment.routes";
import likeRoutes from "./like.routes";
import bookmarkRoutes from "./bookmark.routes";
import profileRoutes from "./profile.routes";
import categoryRoutes from "./category.routes";
import searchRoutes from "./search.routes";
import uploadRoutes from "./upload.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/", commentRoutes);
router.use("/", likeRoutes);
router.use("/bookmarks", bookmarkRoutes);
router.use("/profile", profileRoutes);
router.use("/categories", categoryRoutes);
router.use("/search", searchRoutes);
router.use("/upload", uploadRoutes);

export default router;
