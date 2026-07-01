import multer from "multer";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      // Passing `false` (not an Error) here is the documented multer pattern —
      // it rejects the file without aborting the request with a thrown error,
      // and the controller below reports a clean "no file" message. Passing a
      // cast ApiError here (the previous behavior) bypassed multer's own
      // error formatting and produced an opaque failure on the client.
      cb(null, false);
      (_req as { fileValidationError?: string }).fileValidationError =
        "Only JPEG, PNG, WEBP, or GIF images are allowed.";
      return;
    }
    cb(null, true);
  },
});
