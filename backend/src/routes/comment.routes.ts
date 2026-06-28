import { Router } from "express";
import { addComment, updateComment, deleteComment, getBlogComments } from "../controllers/comment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { addCommentValidator, updateCommentValidator, commentIdValidator } from "../validators/comment.validator";
import { writeLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.get("/blogs/:blogId/comments", getBlogComments);
router.post("/blogs/:blogId/comments", requireAuth, writeLimiter, validate(addCommentValidator), addComment);

router.patch("/comments/:id", requireAuth, validate(updateCommentValidator), updateComment);
router.delete("/comments/:id", requireAuth, validate(commentIdValidator), deleteComment);

export default router;
