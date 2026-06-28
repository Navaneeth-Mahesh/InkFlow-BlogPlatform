"use client";

import * as React from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { BlogCard } from "@/components/shared/blog-card";
import { DeleteBlogDialog } from "@/components/profile/delete-blog-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "@/types";
import { deleteBlog } from "@/lib/services/blog.service";
import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "@/lib/api-client";
import { useRouter } from "next/navigation";

/**
 * Wraps the standard BlogCard with an owner-only menu (top-right) for
 * editing or deleting a published post directly from the profile page.
 */
export function ProfilePostCard({
  post,
  index,
  onDeleted,
}: {
  post: Post;
  index?: number;
  onDeleted: (id: string) => void;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBlog(post.id);
      toast({ variant: "success", title: "Story deleted" });
      onDeleted(post.id);
    } catch (err) {
      toast({
        variant: "error",
        title: "Couldn't delete story",
        description: err instanceof ApiClientError ? err.message : "Please try again.",
      });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="relative">
      <BlogCard post={post} index={index} />

      <DropdownMenu>
        <DropdownMenuTrigger
          className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-text-primary shadow-sm outline-none hover:bg-white dark:hover:bg-black/80 transition-colors"
          aria-label="Story options"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => router.push(`/edit/${post.slug}`)}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteBlogDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={post.title}
        deleting={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
