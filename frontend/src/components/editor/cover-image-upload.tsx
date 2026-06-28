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

export function CoverImageUpload({ value, onChange }: { value: string | null; onChange: (url: string | null) => void }) {
  const [dragging, setDragging] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl);
    setUploading(true);

    try {
      const result = await uploadImage(file);
      onChange(result.url);
    } catch {
      toast({ variant: "error", title: "Upload failed", description: "Couldn't upload that image. Try a smaller file or pick a stock cover." });
      onChange(null);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className="relative rounded-2xl overflow-hidden aspect-[16/7] border border-border group">
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
            "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed aspect-[16/7] cursor-pointer transition-colors",
            dragging ? "border-accent-violet bg-accent-violet/5" : "border-border hover:border-border-strong bg-surface-sunken"
          )}
        >
          <motion.div animate={dragging ? { scale: 1.1 } : { scale: 1 }} className="h-12 w-12 rounded-full bg-surface flex items-center justify-center">
            <ImagePlus className="h-5 w-5 text-text-secondary" />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">Drop a cover image, or click to browse</p>
            <p className="text-xs text-text-tertiary mt-1">Recommended: 1600×900, JPG or PNG, up to 5MB</p>
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
