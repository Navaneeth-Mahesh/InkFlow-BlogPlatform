"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Clock, Calendar, ChevronLeft, Eye } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ReadingProgressBar } from "@/components/blog/reading-progress-bar";
import { ArticleActionRail } from "@/components/blog/article-action-rail";
import { CommentsSection } from "@/components/blog/comments-section";
import { RelatedPosts } from "@/components/blog/related-posts";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LikeButton } from "@/components/shared/like-button";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { getBlogBySlug, getRelatedBlogs } from "@/lib/services/blog.service";
import { mapBlog } from "@/lib/mappers";
import { formatDate, formatNumber } from "@/lib/utils";
import { useApp } from "@/hooks/use-app-state";
import { Post } from "@/types";
import { ApiClientError } from "@/lib/api-client";

export default function BlogDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const articleRef = React.useRef<HTMLDivElement>(null);
  const { isFollowing, toggleFollow, user, registerAuthorFollowState, registerPostBaseline } = useApp();

  const [post, setPost] = React.useState<Post | null>(null);
  const [related, setRelated] = React.useState<Post[]>([]);
  const [status, setStatus] = React.useState<"loading" | "ok" | "not-found" | "error">("loading");

  React.useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks the start of a new fetch triggered by slug change
    setStatus("loading");

    getBlogBySlug(slug)
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapBlog(raw, user.id || undefined);
        setPost(mapped);
        registerPostBaseline(mapped);
        registerAuthorFollowState(mapped.author);
        setStatus("ok");
        return getRelatedBlogs(raw._id, 3).then((rawRelated) => {
          if (!cancelled) setRelated(rawRelated.map((b) => mapBlog(b, user.id || undefined)));
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err instanceof ApiClientError && err.statusCode === 404 ? "not-found" : "error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (status === "loading") return <BlogDetailSkeleton />;
  if (status === "not-found") return <NotFoundState />;
  if (status === "error" || !post) return <ErrorState onRetry={() => router.refresh()} />;

  const following = isFollowing(post.author.id);
  const isSelf = post.author.username === user.username;

  return (
    <PageShell>
      <ReadingProgressBar targetRef={articleRef} />

      <div className="relative h-[42vh] sm:h-[52vh] min-h-[320px] overflow-hidden bg-ink-900">
        {post.coverImage && <Image src={post.coverImage} alt={post.title} fill priority sizes="100vw" className="object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

        <div className="absolute top-5 left-4 sm:left-6 lg:left-8">
          <Link href="/feed" className="inline-flex items-center gap-1.5 rounded-full glass-panel px-3.5 py-2 text-xs font-medium text-white border-white/20">
            <ChevronLeft className="h-3.5 w-3.5" /> Back to feed
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
            <Badge dotColor={post.category.color} className="bg-white/15 text-white border-white/20 backdrop-blur-md">{post.category.name}</Badge>
            <h1 className="font-display text-[1.85rem] sm:text-[2.75rem] font-semibold text-white leading-[1.1] tracking-tight mt-4 max-w-2xl">{post.title}</h1>
          </div>
        </div>
      </div>

      <div ref={articleRef} className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-7 border-b border-border">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author.username}`}>
              <InitialsAvatar name={post.author.name} size="lg" />
            </Link>
            <div>
              <Link href={`/profile/${post.author.username}`} className="font-semibold text-text-primary hover:text-accent-violet transition-colors">{post.author.name}</Link>
              <div className="flex items-center gap-2.5 text-xs text-text-tertiary mt-0.5">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(post.publishedAt)}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readTime} min read</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatNumber(post.views)}</span>
              </div>
            </div>
          </div>

          {!isSelf && (
            <Button variant={following ? "secondary" : "primary"} size="sm" onClick={() => toggleFollow(post.author.id, post.author.username)}>
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <div className="flex lg:hidden items-center justify-between py-4 border-b border-border">
          <div className="flex items-center gap-5">
            <LikeButton post={post} />
            <button onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-1.5 text-sm text-text-secondary">
              {post.comments}
            </button>
          </div>
          <BookmarkButton post={post} />
        </div>

        <div className="flex gap-8 py-10">
          <ArticleActionRail post={post} />

          <article className="flex-1 min-w-0">
            <div className="prose-ink" dangerouslySetInnerHTML={{ __html: post.content }} />

            <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>
                  <Badge variant="default" className="hover:border-accent-violet/40 hover:text-accent-violet transition-colors">#{tag}</Badge>
                </Link>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-surface-sunken p-6 flex flex-col sm:flex-row items-start gap-4">
              <InitialsAvatar name={post.author.name} size="lg" />
              <div className="flex-1">
                <p className="font-display font-semibold text-text-primary">{post.author.name}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{post.author.role}</p>
                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{post.author.bio}</p>
              </div>
              {!isSelf && (
                <Button variant={following ? "secondary" : "outline"} size="sm" onClick={() => toggleFollow(post.author.id, post.author.username)} className="shrink-0">
                  {following ? "Following" : "Follow"}
                </Button>
              )}
            </div>
          </article>
        </div>

        <CommentsSection postId={post.id} />

        <div className="py-14">
          <RelatedPosts posts={related} />
        </div>
      </div>
    </PageShell>
  );
}

function BlogDetailSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-[42vh] sm:h-[52vh] min-h-[320px] w-full rounded-none" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 pb-7 border-b border-border">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex flex-col gap-4 py-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${85 - i * 6}%` }} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function NotFoundState() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">This story ran out of ink</h1>
        <p className="text-text-secondary mt-3">It might have been moved, unpublished, or never existed.</p>
        <Button asChild className="mt-6"><Link href="/feed">Back to feed</Link></Button>
      </div>
    </PageShell>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-text-primary">Couldn&apos;t load this story</h1>
        <p className="text-text-secondary mt-3">Check your connection and try again.</p>
        <Button onClick={onRetry} className="mt-6">Retry</Button>
      </div>
    </PageShell>
  );
}
