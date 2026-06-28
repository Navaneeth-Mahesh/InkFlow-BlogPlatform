import { Router } from "express";
import { saveBlog, removeBookmark, toggleBookmark, getSavedBlogs } from "../controllers/bookmark.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { writeLimiter } from "../middleware/rateLimiter.middleware";
import { param } from "express-validator";
import { validate } from "../middleware/validate.middleware";

const router = Router();
const blogIdParam = [param("blogId").isMongoId().withMessage("Invalid blog id")];

router.get("/saved", requireAuth, getSavedBlogs);

router.post("/blogs/:blogId/bookmark", requireAuth, writeLimiter, validate(blogIdParam), saveBlog);
router.delete("/blogs/:blogId/bookmark", requireAuth, writeLimiter, validate(blogIdParam), removeBookmark);
router.post("/blogs/:blogId/bookmark/toggle", requireAuth, writeLimiter, validate(blogIdParam), toggleBookmark);

export default router;
