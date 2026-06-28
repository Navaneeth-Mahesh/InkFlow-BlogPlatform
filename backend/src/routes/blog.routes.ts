import { Router } from "express";
import { createBlog, updateBlog, deleteBlog, getBlogBySlug, getAllBlogs, getTrending, getRelated, getMyBlogs } from "../controllers/blog.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createBlogValidator, updateBlogValidator, blogIdValidator, blogSlugValidator, listBlogsValidator } from "../validators/blog.validator";
import { writeLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.get("/trending", getTrending);
router.get("/my-blogs", requireAuth, getMyBlogs);
router.get("/", validate(listBlogsValidator), getAllBlogs);

router.post("/", requireAuth, writeLimiter, validate(createBlogValidator), createBlog);

router.get("/slug/:slug", optionalAuth, validate(blogSlugValidator), getBlogBySlug);
router.get("/:id/related", validate(blogIdValidator), getRelated);

router.patch("/:id", requireAuth, validate(updateBlogValidator), updateBlog);
router.delete("/:id", requireAuth, validate(blogIdValidator), deleteBlog);

export default router;
