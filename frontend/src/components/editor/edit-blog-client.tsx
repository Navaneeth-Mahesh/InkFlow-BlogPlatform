"use client";

import * as React from "react";
import { useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { Eye, Loader2, Save, Send, Trash2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorSurface } from "@/components/editor/editor-surface";
import { CoverImageUpload } from "@/components/editor/cover-image-upload";
import { CategorySelector, TagInput } from "@/components/editor/category-selector";
import { PreviewModal } from "@/components/editor/preview-modal";
import { getBlogBySlug, updateBlog, deleteBlog } from "@/lib/services/blog.service";
import { mapBlog } from "@/lib/mappers";
import { Post } from "@/types";
import { estimateReadTime } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "@/lib/api-client";
import { useApp } from "@/hooks/use-app-state";

export default function EditBlogClient({ slug }: { slug: string }) {
  const { user, isAuthenticated, isAuthLoading } = useApp();
  const router = useRouter();
  const [post, setPost] = React.useState<Post | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ok" | "not-found" | "error" | "forbidden">("loading");

  React.useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    let cancelled = false;
    getBlogBySlug(slug)
      .then((raw) => {
        if (cancelled) return;
        if (raw.author.username !== user.username) {
          setStatus("forbidden");
          return;
        }
        setPost(mapBlog(raw, user.id));
        setStatus("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err instanceof ApiClientError && err.statusCode === 404 ? "not-found" : "error");
      });

    return () => {
      cancelled = true;
    };
  }, [slug, isAuthenticated, isAuthLoading, user.username, user.id, router]);

  if (status === "loading" || isAuthLoading) return <EditSkeleton />;
  if (status === "not-found") return <SimpleMessage title="Story not found" />;
  if (status === "forbidden") return <SimpleMessage title="You can only edit your own stories" />;
  if (status === "error" || !post) return <SimpleMessage title="Couldn't load this story" />;

  return <EditBlogForm post={post} />;
}

function EditBlogForm({ post }: { post: Post }) {
  const router = useRouter();
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [title, setTitle] = React.useState(post.title);
  const [excerpt, setExcerpt] = React.useState(post.excerpt);
  const [content, setContent] = React.useState(post.content);
  const [coverImage, setCoverImage] = React.useState<string | null>(post.coverImage || null);
  const [categoryName, setCategoryName] = React.useState(post.category.name);
  const [tags, setTags] = React.useState<string[]>(post.tags);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const previewCategory = categoryName.trim()
    ? { ...post.category, name: categoryName.trim() }
    : post.category;
  const readTime = estimateReadTime(content);

  function handleCommand(cmd: string) {
    editorRef.current?.focus();
    if (cmd.startsWith("formatBlock:")) {
      document.execCommand("formatBlock", false, cmd.split(":")[1]);
    } else if (cmd === "createLink") {
      const url = window.prompt("Paste a URL");
      if (url) document.execCommand("createLink", false, url);
    } else {
      document.execCommand(cmd);
    }
    setContent(editorRef.current?.innerHTML ?? "");
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateBlog(post.id, { title, content, excerpt, category: categoryName.trim() || undefined, tags, coverImage: coverImage ?? undefined });
      toast({ variant: "success", title: "Changes saved" });
    } catch (err) {
      toast({ variant: "error", title: "Couldn't save changes", description: err instanceof ApiClientError ? err.message : "Please try again." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    setPublishing(true);
    try {
      const updated = await updateBlog(post.id, { title, content, excerpt, category: categoryName.trim() || undefined, tags, coverImage: coverImage ?? undefined, status: "published" });
      toast({ variant: "success", title: "Story updated", description: "Your changes are live." });
      router.push(`/blog/${updated.slug}`);
    } catch (err) {
      toast({ variant: "error", title: "Couldn't update story", description: err instanceof ApiClientError ? err.message : "Please try again." });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBlog(post.id);
      toast({ variant: "success", title: "Story deleted" });
      router.push(`/profile/${post.author.username}`);
    } catch (err) {
      toast({ variant: "error", title: "Couldn't delete story", description: err instanceof ApiClientError ? err.message : "Please try again." });
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 pb-28">
        <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to story
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">Edit story</h1>
            <p className="text-text-secondary text-sm mt-1.5">{post.status === "draft" ? "Draft" : "Published"} · {readTime} min read</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)}>
              <Eye className="h-3.5 w-3.5" /> Preview
            </Button>
            <Button variant="outline" size="icon" className="text-accent-coral border-accent-coral/30 hover:bg-accent-coral/10" onClick={() => setDeleteOpen(true)} aria-label="Delete story">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg h-14 font-display" />
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} maxLength={180} className="min-h-16" />
            <p className="text-xs text-text-tertiary mt-1.5 text-right">{excerpt.length}/180</p>
          </div>

          <div>
            <Label>Cover image</Label>
            <CoverImageUpload value={coverImage} onChange={setCoverImage} />
          </div>

          <div>
            <Label>Category</Label>
            <CategorySelector value={categoryName} onChange={setCategoryName} />
          </div>

          <div>
            <Label>Tags</Label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          <div>
            <Label>Story content</Label>
            <div className="flex flex-col gap-3">
              <EditorToolbar onCommand={handleCommand} />
              <div className="rounded-xl border border-border bg-surface px-6 py-6">
                <EditorSurface ref={editorRef} value={content} onChange={setContent} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg-elevated/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="md" className="gap-1.5" onClick={handleSave} disabled={saving || publishing}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </Button>
          <Button size="md" className="gap-1.5" onClick={handleUpdate} disabled={saving || publishing}>
            {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {post.status === "draft" ? "Publish" : "Update story"}
          </Button>
        </div>
      </div>

      <PreviewModal open={previewOpen} onOpenChange={setPreviewOpen} title={title} content={content} coverImage={coverImage} category={previewCategory} readTime={readTime} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this story?</DialogTitle>
            <DialogDescription>This can&apos;t be undone. &ldquo;{post.title}&rdquo; will be permanently removed.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="coral" onClick={handleDelete} disabled={deleting} className="gap-1.5">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditSkeleton() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-9 w-48 mb-8" />
        <div className="flex flex-col gap-7">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="aspect-[16/7] w-full rounded-2xl" />
        </div>
      </main>
    </>
  );
}

function SimpleMessage({ title }: { title: string }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">{title}</h1>
        <Button asChild className="mt-6"><Link href="/feed">Back to feed</Link></Button>
      </main>
    </>
  );
}
