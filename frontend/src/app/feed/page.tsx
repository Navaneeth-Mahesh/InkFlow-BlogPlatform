"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CategoryPills } from "@/components/feed/category-pills";
import { RecommendedSidebar } from "@/components/feed/recommended-sidebar";
import { BlogCard } from "@/components/shared/blog-card";
import { BlogCardSkeleton } from "@/components/shared/blog-card-skeleton";
import { Reveal } from "@/components/shared/reveal";
import { listBlogs } from "@/lib/services/blog.service";
import { getCategories } from "@/lib/services";
import { mapBlog, mapCategory } from "@/lib/mappers";
import { Post, Category } from "@/types";
import { useApp } from "@/hooks/use-app-state";

const SORT_OPTIONS = [
  { id: "latest", label: "Latest" },
  { id: "popular", label: "Most liked" },
  { id: "discussed", label: "Most discussed" },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]["id"];

export default function FeedPage() {
  const { user } = useApp();
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<SortId>("latest");

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState(false);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    getCategories()
      .then((raw) => setCategories(raw.map(mapCategory)))
      .catch(() => setCategories([]));
  }, []);

  const fetchPage = React.useCallback(
    async (pageNum: number, append: boolean) => {
      append ? setLoadingMore(true) : setInitialLoading(true);
      setError(false);
      try {
        const { blogs, meta } = await listBlogs({
          page: pageNum,
          limit: 6,
          category: activeCategory ?? undefined,
          sort,
          q: debouncedQuery || undefined,
        });
        const mapped = blogs.map((b) => mapBlog(b, user.id || undefined));
        setPosts((prev) => (append ? [...prev, ...mapped] : mapped));
        setHasMore(meta?.hasMore ?? false);
        setTotal(meta?.total ?? mapped.length);
        setPage(pageNum);
      } catch {
        setError(true);
        if (!append) setPosts([]);
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [activeCategory, sort, debouncedQuery, user.id]
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting a new fetch is the actual synchronization target of this effect
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, sort, debouncedQuery]);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !initialLoading) {
          fetchPage(page + 1, true);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, initialLoading, page, fetchPage]);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight">Your feed</h1>
              <p className="text-text-secondary mt-1.5 text-[15px]">
                {initialLoading ? "Loading stories…" : `${total} ${total === 1 ? "story" : "stories"} for you to dig into today`}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search the feed…"
                className="w-full h-11 rounded-full border border-border bg-surface pl-10 pr-4 text-[14px] outline-none focus:border-accent-violet focus:ring-4 focus:ring-accent-violet/10 transition-all"
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="flex items-center justify-between gap-4 mb-8">
            <CategoryPills categories={categories} active={activeCategory} onChange={setActiveCategory} />
            <div className="hidden md:flex items-center gap-1 shrink-0 text-text-secondary">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <select value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="bg-transparent text-[13px] font-medium outline-none cursor-pointer">
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Reveal>

        <div className="flex gap-10">
          <div className="flex-1 min-w-0">
            {initialLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <ErrorState onRetry={() => fetchPage(1, false)} />
            ) : posts.length === 0 ? (
              <EmptyState query={debouncedQuery} onClear={() => { setQuery(""); setActiveCategory(null); }} />
            ) : (
              <>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                    {posts.map((post, i) => (
                      <motion.div key={post.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}>
                        <BlogCard post={post} index={i} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                <div ref={sentinelRef} className="mt-8">
                  {loadingMore && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <BlogCardSkeleton />
                      <BlogCardSkeleton />
                    </div>
                  )}
                  {!hasMore && !loadingMore && (
                    <p className="text-center text-sm text-text-tertiary py-8">You&apos;ve reached the end — that&apos;s every story we&apos;ve got for now.</p>
                  )}
                </div>
              </>
            )}
          </div>

          <RecommendedSidebar />
        </div>
      </div>
    </PageShell>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-6 rounded-2xl border border-dashed border-border">
      <div className="h-14 w-14 rounded-full bg-surface-sunken flex items-center justify-center mb-4">
        <Search className="h-6 w-6 text-text-tertiary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary">Nothing matches {query ? `"${query}"` : "those filters"}</h3>
      <p className="text-sm text-text-secondary mt-2 max-w-sm">Try a different word, or clear your filters to see everything in the feed again.</p>
      <button onClick={onClear} className="mt-5 text-sm font-medium text-accent-violet hover:underline">Clear filters</button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-6 rounded-2xl border border-dashed border-border">
      <h3 className="font-display text-lg font-semibold text-text-primary">Couldn&apos;t load the feed</h3>
      <p className="text-sm text-text-secondary mt-2 max-w-sm">Check that the API server is running, then try again.</p>
      <button onClick={onRetry} className="mt-5 text-sm font-medium text-accent-violet hover:underline">Retry</button>
    </div>
  );
}
