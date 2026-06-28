import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cloudinary } from "../config/cloudinary";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface UploadResult {
  url: string;
  publicId: string;
}

const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
const LOCAL_URL_PREFIX = "/uploads";

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

export async function uploadImageBuffer(buffer: Buffer, mimetype: string, folder = "inkflow"): Promise<UploadResult> {
  if (env.isCloudinaryConfigured) return uploadToCloudinary(buffer, folder);
  return uploadToLocalDisk(buffer, mimetype, folder);
}

export async function deleteImage(publicId: string): Promise<void> {
  if (env.isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(publicId);
    return;
  }
  const filePath = path.join(LOCAL_UPLOAD_DIR, publicId);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function uploadToCloudinary(buffer: Buffer, folder: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: "image" }, (error, result) => {
      if (error || !result) {
        reject(ApiError.internal(`Image upload failed: ${error?.message ?? "unknown error"}`));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    stream.end(buffer);
  });
}

function extensionFor(mimetype: string): string {
  switch (mimetype) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

async function uploadToLocalDisk(buffer: Buffer, mimetype: string, folder: string): Promise<UploadResult> {
  ensureLocalDir();
  const filename = `${folder}-${crypto.randomUUID()}.${extensionFor(mimetype)}`;
  const filePath = path.join(LOCAL_UPLOAD_DIR, filename);
  await fs.promises.writeFile(filePath, buffer);
  return { url: `${LOCAL_URL_PREFIX}/${filename}`, publicId: filename };
}
