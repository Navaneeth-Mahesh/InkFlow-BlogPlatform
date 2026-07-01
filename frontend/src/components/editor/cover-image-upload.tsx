"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ImagePlus, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/lib/services";
import { toast } from "@/hooks/use-toast";

const STOCK_OPTIONS = [
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop",
];

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — must match the backend's multer limit
const TARGET_ASPECT_RATIO = 16 / 9;
// How far off 16:9 a real photo is allowed to be before we reject it.
// Exact 16:9 from a camera/screenshot is rare, so this is a tolerance band,
// not an exact-match requirement.
const ASPECT_RATIO_TOLERANCE = 0.06;

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image file."));
    };
    img.src = url;
  });
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function CoverImageUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    // --- Validate before doing anything else: type, size, then aspect ratio.
    // Each check has its own specific message so a rejected upload always
    // explains exactly why, rather than a generic "upload failed".
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast({
        variant: "error",
        title: "Unsupported file type",
        description: "Please choose a JPEG, PNG, WEBP, or GIF image.",
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        variant: "error",
        title: "Image too large",
        description: `That file is ${formatBytes(file.size)} — covers must be 5MB or smaller.`,
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    let dimensions: { width: number; height: number };
    try {
      dimensions = await readImageDimensions(file);
    } catch {
      toast({
        variant: "error",
        title: "Couldn't read that image",
        description: "The file may be corrupted. Try a different image.",
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const actualRatio = dimensions.width / dimensions.height;
    const ratioOff = Math.abs(actualRatio - TARGET_ASPECT_RATIO) / TARGET_ASPECT_RATIO;
    if (ratioOff > ASPECT_RATIO_TOLERANCE) {
      toast({
        variant: "error",
        title: "Use a 16:9 cover image",
        description: `That image is ${dimensions.width}×${dimensions.height} (not close enough to 16:9). Try cropping it to a widescreen shape, e.g. 1600×900.`,
      });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Validation passed — show an instant local preview while the real
    // upload completes in the background.
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl);
    setUploading(true);

    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch {
      toast({
        variant: "error",
        title: "Upload failed",
        description: "The server rejected that upload. Try a different image or check your connection.",
      });
      onChange(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-border group">
          <Image src={value} alt="Cover preview" fill className="object-cover" unoptimized={value.startsWith("blob:")} />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-white text-ink-900 px-4 py-2 text-sm font-medium flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Replace
            </button>
            <button type="button" onClick={() => onChange(null)} className="rounded-full bg-white/90 text-accent-coral h-9 w-9 flex items-center justify-center" aria-label="Remove cover image">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed aspect-[16/9] cursor-pointer transition-colors",
            dragging ? "border-accent-violet bg-accent-violet/5" : "border-border hover:border-border-strong bg-surface-sunken"
          )}
        >
          <motion.div animate={dragging ? { scale: 1.1 } : { scale: 1 }} className="h-12 w-12 rounded-full bg-surface flex items-center justify-center">
            <ImagePlus className="h-5 w-5 text-text-secondary" />
          </motion.div>
          <div className="text-center px-6">
            <p className="text-sm font-medium text-text-primary">Drop a 16:9 cover image, or click to browse</p>
            <p className="text-xs text-text-tertiary mt-1">JPG, PNG, WEBP, or GIF · 16:9 widescreen · up to 5MB (e.g. 1600×900)</p>
          </div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      <div className="mt-4">
        <p className="text-xs text-text-tertiary mb-2">Or pick a stock cover</p>
        <div className="flex gap-2.5">
          {STOCK_OPTIONS.map((url) => (
            <button key={url} type="button" onClick={() => onChange(url)} className={cn("relative h-14 w-20 rounded-lg overflow-hidden border-2 transition-all", value === url ? "border-accent-violet" : "border-transparent hover:border-border-strong")}>
              <Image src={url} alt="Stock cover option" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
