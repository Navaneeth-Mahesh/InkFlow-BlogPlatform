import { Router } from "express";
import { likeBlog, unlikeBlog, toggleLike } from "../controllers/like.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { writeLimiter } from "../middleware/rateLimiter.middleware";
import { param } from "express-validator";
import { validate } from "../middleware/validate.middleware";

const router = Router();
const blogIdParam = [param("blogId").isMongoId().withMessage("Invalid blog id")];

router.post("/blogs/:blogId/like", requireAuth, writeLimiter, validate(blogIdParam), likeBlog);
router.delete("/blogs/:blogId/like", requireAuth, writeLimiter, validate(blogIdParam), unlikeBlog);
router.post("/blogs/:blogId/like/toggle", requireAuth, writeLimiter, validate(blogIdParam), toggleLike);

export default router;
