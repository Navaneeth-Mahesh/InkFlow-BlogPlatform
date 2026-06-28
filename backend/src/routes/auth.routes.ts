import { Router } from "express";
import { register, login, logout, refresh, getMe } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { registerValidator, loginValidator } from "../validators/auth.validator";
import { requireAuth } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

router.post("/register", authLimiter, validate(registerValidator), register);
router.post("/login", authLimiter, validate(loginValidator), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", requireAuth, getMe);

export default router;
