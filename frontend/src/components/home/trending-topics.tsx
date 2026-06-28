"use client";

import * as React from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrendingBlogs } from "@/lib/services/blog.service";
import { getCategories } from "@/lib/services";
import { mapCategory } from "@/lib/mappers";
import { Category } from "@/types";

export function TrendingTopics() {
  const [topics, setTopics] = React.useState<{ tag: string; count: number }[] | null>(null);
  const [categories, setCategories] = React.useState<Category[] | null>(null);

  React.useEffect(() => {
    getTrendingBlogs(20)
      .then((blogs) => {
        const counts = new Map<string, number>();
        blogs.forEach((b) => b.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
        const sorted = Array.from(counts.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setTopics(sorted);
      })
      .catch(() => setTopics([]));

    getCategories()
      .then((raw) => setCategories(raw.map(mapCategory)))
      .catch(() => setCategories([]));
  }, []);

  if (topics && categories && topics.length === 0 && categories.length === 0) return null;

  return (
    <section className="bg-surface-sunken border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <Reveal>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-accent-coral" />
            <p className="text-xs font-mono uppercase tracking-wider text-accent-coral">Trending now</p>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-10">What people are writing about</h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-3">
              {!topics ? (
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-28 rounded-full" />)
              ) : topics.length === 0 ? (
                <p className="text-sm text-text-tertiary">No trending tags yet — be the first to publish.</p>
              ) : (
                topics.map((t, i) => (
                  <Link
                    key={t.tag}
                    href={`/search?q=${encodeURIComponent(t.tag)}`}
                    className="group flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 hover:border-accent-violet/40 hover:bg-accent-violet/5 transition-colors"
                  >
                    <span className="font-mono text-xs text-text-tertiary">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-medium text-text-primary group-hover:text-accent-violet transition-colors">#{t.tag}</span>
                  </Link>
                ))
              )}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm font-medium text-text-primary mb-4">Browse by category</p>
              <div className="flex flex-col gap-1">
                {!categories
                  ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)
                  : categories.map((c) => (
                      <Link key={c.id} href={`/search?category=${c.slug}`} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-surface-sunken transition-colors group">
                        <span className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-sm text-text-primary group-hover:text-accent-violet transition-colors">{c.name}</span>
                        </span>
                        <span className="text-xs font-mono text-text-tertiary">{c.postCount}</span>
                      </Link>
                    ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
