import { Router } from "express";
import { uploadCoverImage } from "../controllers/upload.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadImage } from "../middleware/upload.middleware";

const router = Router();
router.post("/image", requireAuth, uploadImage.single("image"), uploadCoverImage);

export default router;
