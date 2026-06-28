import { Router } from "express";
import { getProfile, updateProfile, getUserBlogs, toggleFollow } from "../controllers/profile.controller";
import { requireAuth, optionalAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { updateProfileValidator } from "../validators/auth.validator";
import { writeLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.patch("/me", requireAuth, validate(updateProfileValidator), updateProfile);

router.get("/:username", optionalAuth, getProfile);
router.get("/:username/blogs", optionalAuth, getUserBlogs);
router.post("/:username/follow", requireAuth, writeLimiter, toggleFollow);

export default router;
