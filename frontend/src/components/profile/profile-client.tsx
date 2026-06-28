"use client";

import * as React from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, MapPin, Link2, Settings, PenSquare, FileText, Bookmark as BookmarkIcon, Inbox } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfilePostCard } from "@/components/profile/profile-post-card";
import { DraftCard } from "@/components/profile/draft-card";
import { ProfileStats } from "@/components/profile/profile-stats";
import { ProfileSkeleton } from "@/components/profile/profile-skeleton";
import { Reveal } from "@/components/shared/reveal";
import { getProfile, getUserBlogs } from "@/lib/services/profile.service";
import { getSavedBlogs } from "@/lib/services/bookmark.service";
import { mapAuthor, mapBlog } from "@/lib/mappers";
import { Author, Post } from "@/types";
import { ProfileStats as ProfileStatsType } from "@/types/api";
import { formatDate } from "@/lib/utils";
import { useApp } from "@/hooks/use-app-state";
import { ApiClientError } from "@/lib/api-client";
import { BlogCard } from "@/components/shared/blog-card";

export default function ProfileClient({ username }: { username: string }) {
  const { user, registerAuthorFollowState } = useApp();
  const [author, setAuthor] = React.useState<Author | null>(null);
  const [stats, setStats] = React.useState<ProfileStatsType | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ok" | "not-found" | "error">("loading");

  React.useEffect(() => {
    let cancelled = false;
    getProfile(username)
      .then(({ user: rawUser, stats: rawStats }) => {
        if (cancelled) return;
        const mapped = mapAuthor(rawUser, user.id || undefined);
        setAuthor(mapped);
        setStats(rawStats);
        registerAuthorFollowState(mapped);
        setStatus("ok");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err instanceof ApiClientError && err.statusCode === 404 ? "not-found" : "error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, user.id]);

  if (status === "loading") return <ProfileSkeleton />;
  if (status === "not-found") notFound();
  if (status === "error" || !author || !stats) {
    return (
      <PageShell>
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="font-display text-2xl font-semibold text-text-primary">Couldn&apos;t load this profile</h1>
          <Button asChild className="mt-6"><Link href="/feed">Back to feed</Link></Button>
        </div>
      </PageShell>
    );
  }

  return <ProfileView author={author} stats={stats} />;
}

function ProfileView({ author, stats }: { author: Author; stats: ProfileStatsType }) {
  const searchParams = useSearchParams();
  const { user, isFollowing, toggleFollow } = useApp();

  const isSelf = author.username === user.username;
  const following = isFollowing(author.id);

  const initialTab = searchParams.get("tab") ?? "published";
  const [tab, setTab] = React.useState(initialTab);

  const [published, setPublished] = React.useState<Post[] | null>(null);
  const [drafts, setDrafts] = React.useState<Post[] | null>(null);
  const [saved, setSaved] = React.useState<Post[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getUserBlogs(author.username, { limit: 50 })
      .then(({ blogs }) => {
        if (cancelled) return;
        const mapped = blogs.map((b) => mapBlog(b, user.id || undefined));
        setPublished(mapped.filter((p) => p.status === "published"));
        setDrafts(mapped.filter((p) => p.status === "draft"));
      })
      .catch(() => {
        if (!cancelled) {
          setPublished([]);
          setDrafts([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [author.username, user.id]);

  React.useEffect(() => {
    if (!isSelf) return;
    let cancelled = false;
    getSavedBlogs({ limit: 50 })
      .then(({ blogs }) => {
        if (!cancelled) setSaved(blogs.map((b) => mapBlog(b, user.id || undefined)));
      })
      .catch(() => {
        if (!cancelled) setSaved([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isSelf, user.id]);

  function handlePublishedDeleted(id: string) {
    setPublished((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
  }

  function handleDraftDeleted(id: string) {
    setDrafts((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-10">
            <InitialsAvatar name={author.name} size="xl" ringClassName="ring-4 ring-surface-sunken" className="shrink-0" />

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold text-text-primary">{author.name}</h1>
                  <p className="text-text-tertiary text-sm mt-0.5">@{author.username}</p>
                  <p className="text-sm text-accent-violet font-medium mt-1">{author.role}</p>
                </div>

                {isSelf ? (
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="gap-1.5">
                      <Settings className="h-3.5 w-3.5" /> Edit profile
                    </Button>
                    <Button size="sm" asChild className="gap-1.5">
                      <Link href="/create"><PenSquare className="h-3.5 w-3.5" /> Write</Link>
                    </Button>
                  </div>
                ) : (
                  <Button variant={following ? "secondary" : "primary"} size="sm" onClick={() => toggleFollow(author.id, author.username)}>
                    {following ? "Following" : "Follow"}
                  </Button>
                )}
              </div>

              <p className="text-[15px] text-text-secondary leading-relaxed mt-4 max-w-xl">{author.bio}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-text-tertiary">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined {formatDate(author.joinedAt)}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Remote</span>
                <span className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> inkflow.io/{author.username}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <ProfileStats postsCount={stats.publishedCount} totalLikes={stats.totalLikes} followers={stats.followersCount} bookmarksCount={saved?.length ?? 0} />
        </Reveal>

        <div className="mt-10">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="published">Published</TabsTrigger>
              {isSelf && <TabsTrigger value="drafts">Drafts</TabsTrigger>}
              {isSelf && <TabsTrigger value="saved">Saved</TabsTrigger>}
            </TabsList>

            <TabsContent value="published">
              {published === null ? (
                <LoadingGrid />
              ) : published.length === 0 ? (
                <EmptyTab
                  icon={FileText}
                  title="No published stories yet"
                  description={isSelf ? "When you publish a story, it'll show up here." : `${author.name} hasn't published anything yet.`}
                  action={isSelf ? { label: "Write your first story", href: "/create" } : undefined}
                />
              ) : (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {published.map((post, i) =>
                    isSelf ? (
                      <Reveal key={post.id} delay={i * 0.05}>
                        <ProfilePostCard post={post} index={i} onDeleted={handlePublishedDeleted} />
                      </Reveal>
                    ) : (
                      <Reveal key={post.id} delay={i * 0.05}>
                        <BlogCard post={post} index={i} />
                      </Reveal>
                    )
                  )}
                </motion.div>
              )}
            </TabsContent>

            {isSelf && (
              <TabsContent value="drafts">
                {drafts === null ? (
                  <LoadingGrid />
                ) : drafts.length === 0 ? (
                  <EmptyTab icon={Inbox} title="No drafts in progress" description="Start a new story and save it as a draft to come back to later." action={{ label: "Start writing", href: "/create" }} />
                ) : (
                  <div className="flex flex-col gap-4">
                    {drafts.map((post) => <DraftCard key={post.id} post={post} onDeleted={handleDraftDeleted} />)}
                  </div>
                )}
              </TabsContent>
            )}

            {isSelf && (
              <TabsContent value="saved">
                {saved === null ? (
                  <LoadingGrid />
                ) : saved.length === 0 ? (
                  <EmptyTab icon={BookmarkIcon} title="Nothing saved yet" description="Bookmark stories from the feed to build your reading list." action={{ label: "Browse the feed", href: "/feed" }} />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {saved.map((post, i) => (
                      <Reveal key={post.id} delay={i * 0.05}>
                        <BlogCard post={post} index={i} />
                      </Reveal>
                    ))}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </PageShell>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[4/3] rounded-2xl bg-surface-sunken animate-pulse" />)}
    </div>
  );
}

function EmptyTab({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center text-center py-20 rounded-2xl border border-dashed border-border">
      <div className="h-14 w-14 rounded-full bg-surface-sunken flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-text-tertiary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary mt-2 max-w-sm">{description}</p>
      {action && <Button asChild size="sm" className="mt-5"><Link href={action.href}>{action.label}</Link></Button>}
    </div>
  );
}
