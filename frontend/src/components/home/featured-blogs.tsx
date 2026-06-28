"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BlogCard } from "@/components/shared/blog-card";
import { BlogCardSkeletonGrid } from "@/components/shared/blog-card-skeleton";
import { Reveal } from "@/components/shared/reveal";
import { getTrendingBlogs } from "@/lib/services/blog.service";
import { mapBlog } from "@/lib/mappers";
import { Post } from "@/types";
import { useApp } from "@/hooks/use-app-state";

export function FeaturedBlogs() {
  const { user } = useApp();
  const [posts, setPosts] = React.useState<Post[] | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    getTrendingBlogs(5)
      .then((raw) => {
        if (!cancelled) setPosts(raw.map((b) => mapBlog(b, user.id || undefined)));
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  if (posts && posts.length === 0) return null;

  const [lead, ...rest] = posts ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <Reveal>
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-accent-violet mb-2">Editor&apos;s picks</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">Featured this week</h2>
          </div>
          <Link href="/feed" className="hidden sm:flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-accent-violet transition-colors shrink-0">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      {!posts ? (
        <BlogCardSkeletonGrid count={5} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Reveal className="lg:row-span-2">
            <BlogCard post={lead} variant="featured" />
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rest.slice(0, 4).map((post, i) => (
              <Reveal key={post.id} delay={0.1 + i * 0.05}>
                <BlogCard post={post} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
