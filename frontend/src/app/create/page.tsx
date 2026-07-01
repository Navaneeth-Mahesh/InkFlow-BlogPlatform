"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, Loader2, Save, Send, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorSurface } from "@/components/editor/editor-surface";
import { CoverImageUpload } from "@/components/editor/cover-image-upload";
import { CategorySelector, TagInput } from "@/components/editor/category-selector";
import { PreviewModal } from "@/components/editor/preview-modal";
import { createBlog } from "@/lib/services/blog.service";
import { estimateReadTime } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "@/lib/api-client";
import { useApp } from "@/hooks/use-app-state";

export default function CreateBlogPage() {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useApp();
  const editorRef = React.useRef<HTMLDivElement>(null);

  const [title, setTitle] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [content, setContent] = React.useState("");
  const [coverImage, setCoverImage] = React.useState<string | null>(null);
  const [categoryName, setCategoryName] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [titleError, setTitleError] = React.useState("");

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({ variant: "error", title: "Sign in required", description: "Create a free account to publish on InkFlow." });
      router.replace("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Synthetic preview-only category — the real one is created/resolved by
  // the backend from the typed name when the post is actually saved.
  const previewCategory = categoryName.trim()
    ? { id: "preview", name: categoryName.trim(), slug: "", color: "#6750E3", postCount: 0 }
    : null;
  const readTime = estimateReadTime(content);
  const wordCount = content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

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

  async function submit(status: "draft" | "published") {
    if (!title.trim()) {
      setTitleError(status === "draft" ? "Give your draft a title before saving." : "Your story needs a title before it can go live.");
      return;
    }
    if (status === "published" && !categoryName.trim()) {
      toast({ variant: "error", title: "Add a category", description: "Readers find stories through categories — type one before publishing." });
      return;
    }
    if (status === "published" && !content.trim()) {
      toast({ variant: "error", title: "Your story is empty", description: "Write something before publishing." });
      return;
    }

    const setLoading = status === "draft" ? setSaving : setPublishing;
    setLoading(true);

    try {
      const blog = await createBlog({
        title: title.trim(),
        content: content || "<p></p>",
        excerpt: excerpt.trim() || undefined,
        category: categoryName.trim() || "General",
        tags,
        coverImage: coverImage ?? undefined,
        status,
      });

      toast({
        variant: "success",
        title: status === "draft" ? "Draft saved" : "Published!",
        description: status === "draft" ? "Find it anytime in your profile under Drafts." : "Your story is now live on InkFlow.",
      });

      if (status === "published") router.push(`/blog/${blog.slug}`);
      else router.push(`/profile/${blog.author.username}?tab=drafts`);
    } catch (err) {
      toast({
        variant: "error",
        title: status === "draft" ? "Couldn't save draft" : "Couldn't publish",
        description: err instanceof ApiClientError ? err.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center text-text-tertiary">Checking your session…</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 pb-28">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-semibold text-text-primary tracking-tight">Write a new story</h1>
            <p className="text-text-secondary text-sm mt-1.5">{wordCount > 0 ? `${wordCount} words · ${readTime} min read` : "Let's get your idea down."}</p>
          </div>
          <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)}>
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
        </div>

        <div className="flex flex-col gap-7">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(""); }}
              placeholder="Give your story a title that earns the click"
              className="text-lg h-14 font-display"
              aria-invalid={!!titleError}
            />
            {titleError && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-accent-coral mt-1.5">{titleError}</motion.p>
            )}
          </div>

          <div>
            <Label htmlFor="excerpt">Excerpt <span className="text-text-tertiary font-normal">— shown in feed cards</span></Label>
            <Textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="One or two sentences that make someone want to click in" maxLength={180} className="min-h-16" />
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
            <Label>Tags <span className="text-text-tertiary font-normal">— up to 6</span></Label>
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

          <div className="rounded-2xl border border-dashed border-border bg-surface-sunken px-5 py-4 flex items-start gap-3">
            <Sparkles className="h-4 w-4 text-accent-violet mt-0.5 shrink-0" />
            <p className="text-[13px] text-text-secondary leading-relaxed">
              Tip: stories with a clear first paragraph and at least one subheading get read to completion noticeably more often. Use the{" "}
              <strong className="text-text-primary font-medium">H2</strong> tool in the toolbar to break up long sections.
            </p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg-elevated/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3">
          <p className="text-xs text-text-tertiary hidden sm:block">Save drafts often — autosave isn&apos;t on yet.</p>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button variant="secondary" size="md" className="gap-1.5 flex-1 sm:flex-initial" onClick={() => submit("draft")} disabled={saving || publishing}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save draft
            </Button>
            <Button size="md" className="gap-1.5 flex-1 sm:flex-initial" onClick={() => submit("published")} disabled={saving || publishing}>
              {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Publish
            </Button>
          </div>
        </div>
      </div>

      <PreviewModal open={previewOpen} onOpenChange={setPreviewOpen} title={title} content={content} coverImage={coverImage} category={previewCategory} readTime={readTime} />
    </>
  );
}
