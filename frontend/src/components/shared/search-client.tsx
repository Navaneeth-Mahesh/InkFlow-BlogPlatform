"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Users, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { CategoryPills } from "@/components/feed/category-pills";
import { BlogCard } from "@/components/shared/blog-card";
import { BlogCardSkeletonGrid } from "@/components/shared/blog-card-skeleton";
import { AuthorCard } from "@/components/shared/author-card";
import { Reveal } from "@/components/shared/reveal";
import { listBlogs } from "@/lib/services/blog.service";
import { searchAuthors, getCategories } from "@/lib/services";
import { mapBlog, mapAuthor, mapCategory } from "@/lib/mappers";
import { Post, Author, Category } from "@/types";
import { useApp } from "@/hooks/use-app-state";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const { user } = useApp();

  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [debouncedQuery, setDebouncedQuery] = React.useState(query);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(searchParams.get("category"));
  const [scope, setScope] = React.useState<"stories" | "authors">("stories");

  const [categories, setCategories] = React.useState<Category[]>([]);
  const [posts, setPosts] = React.useState<Post[] | null>(null);
  const [authors, setAuthors] = React.useState<Author[] | null>(null);
  const [postsTotal, setPostsTotal] = React.useState(0);
  const [authorsTotal, setAuthorsTotal] = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  React.useEffect(() => {
    getCategories().then((raw) => setCategories(raw.map(mapCategory))).catch(() => setCategories([]));
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks the start of a new fetch triggered by query/category change
    setPosts(null);
    listBlogs({ q: debouncedQuery || undefined, category: activeCategory ?? undefined, limit: 24 })
      .then(({ blogs, meta }) => {
        setPosts(blogs.map((b) => mapBlog(b, user.id || undefined)));
        setPostsTotal(meta?.total ?? blogs.length);
      })
      .catch(() => {
        setPosts([]);
        setPostsTotal(0);
      });
  }, [debouncedQuery, activeCategory, user.id]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks the start of a new fetch triggered by query change
    setAuthors(null);
    searchAuthors(debouncedQuery, { limit: 24 })
      .then(({ authors: raw, meta }) => {
        setAuthors(raw.map((a) => mapAuthor(a, user.id || undefined)));
        setAuthorsTotal(meta?.total ?? raw.length);
      })
      .catch(() => {
        setAuthors([]);
        setAuthorsTotal(0);
      });
  }, [debouncedQuery, user.id]);

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <Reveal>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-2">Explore InkFlow</h1>
          <p className="text-text-secondary text-[15px] mb-8">Search across every story, author, and topic on the platform.</p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="relative mb-6 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              autoFocus
              placeholder="Search for stories, topics, or writers…"
              className="w-full h-14 rounded-2xl border border-border bg-surface pl-12 pr-12 text-[15px] outline-none focus:border-accent-violet focus:ring-4 focus:ring-accent-violet/10 transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex items-center gap-1 rounded-full bg-surface-sunken border border-border p-1 w-fit mb-7">
            <ScopeButton active={scope === "stories"} onClick={() => setScope("stories")} icon={FileText} label={`Stories (${postsTotal})`} />
            <ScopeButton active={scope === "authors"} onClick={() => setScope("authors")} icon={Users} label={`Authors (${authorsTotal})`} />
          </div>
        </Reveal>

        {scope === "stories" && (
          <Reveal delay={0.12}>
            <div className="mb-8">
              <CategoryPills categories={categories} active={activeCategory} onChange={setActiveCategory} />
            </div>
          </Reveal>
        )}

        <AnimatePresence mode="wait">
          {scope === "stories" ? (
            <motion.div key="stories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {posts === null ? (
                <BlogCardSkeletonGrid count={6} />
              ) : posts.length === 0 ? (
                <EmptyResults query={debouncedQuery} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, i) => <BlogCard key={post.id} post={post} index={i} />)}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="authors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {authors === null ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-surface-sunken animate-pulse" />)
              ) : authors.length === 0 ? (
                <EmptyResults query={debouncedQuery} />
              ) : (
                authors.map((author) => <AuthorCard key={author.id} author={author} />)
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

function ScopeButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button onClick={onClick} className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${active ? "text-white" : "text-text-secondary hover:text-text-primary"}`}>
      {active && <motion.span layoutId="scope-pill" className="absolute inset-0 rounded-full bg-accent-violet" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
      <span className="relative z-10 flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {label}</span>
    </button>
  );
}

function EmptyResults({ query }: { query: string }) {
  return (
    <div className="col-span-full flex flex-col items-center text-center py-20 rounded-2xl border border-dashed border-border">
      <div className="h-14 w-14 rounded-full bg-surface-sunken flex items-center justify-center mb-4">
        <Search className="h-6 w-6 text-text-tertiary" />
      </div>
      <h3 className="font-display text-lg font-semibold text-text-primary">No results for {query ? `"${query}"` : "this filter"}</h3>
      <p className="text-sm text-text-secondary mt-2 max-w-sm">Try a broader search term or browse by category instead.</p>
    </div>
  );
}
