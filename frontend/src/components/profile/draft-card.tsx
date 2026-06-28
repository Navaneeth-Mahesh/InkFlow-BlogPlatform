"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pencil, Trash2, Clock, Loader2 } from "lucide-react";
import { Post } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteBlogDialog } from "@/components/profile/delete-blog-dialog";
import { deleteBlog } from "@/lib/services/blog.service";
import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/utils";

export function DraftCard({ post, onDeleted }: { post: Post; onDeleted: (id: string) => void }) {
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBlog(post.id);
      toast({ variant: "success", title: "Draft deleted" });
      onDeleted(post.id);
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't delete draft",
        description: err instanceof ApiClientError ? err.message : "Please try again.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
        <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0 bg-surface-sunken">
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-xs text-text-tertiary/40">Ink</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" size="sm">Draft</Badge>
            <span className="text-xs text-text-tertiary flex items-center gap-1">
              <Clock className="h-3 w-3" /> Edited {formatRelativeTime(post.updatedAt ?? post.publishedAt)}
            </span>
          </div>
          <h4 className="font-display font-semibold text-text-primary leading-snug line-clamp-1">{post.title}</h4>
          <p className="text-[13px] text-text-secondary line-clamp-1 mt-1">{post.excerpt || "No excerpt yet."}</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0 justify-center">
          <Button variant="secondary" size="sm" asChild className="gap-1.5">
            <Link href={`/edit/${post.slug}`}>
              <Pencil className="h-3.5 w-3.5" /> Continue
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-accent-coral hover:bg-accent-coral/10 gap-1.5" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </motion.div>

      <DeleteBlogDialog open={deleteOpen} onOpenChange={setDeleteOpen} title={post.title} deleting={deleting} onConfirm={handleDelete} />
    </>
  );
}
