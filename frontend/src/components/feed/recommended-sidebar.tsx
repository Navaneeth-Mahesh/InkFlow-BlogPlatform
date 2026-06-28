"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { BlogCard } from "@/components/shared/blog-card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthorCard } from "@/components/shared/author-card";
import { getTrendingBlogs } from "@/lib/services/blog.service";
import { searchAuthors } from "@/lib/services";
import { mapBlog, mapAuthor } from "@/lib/mappers";
import { Post, Author } from "@/types";
import { useApp } from "@/hooks/use-app-state";

export function RecommendedSidebar() {
  const { user } = useApp();
  const [recommended, setRecommended] = React.useState<Post[] | null>(null);
  const [suggestedAuthor, setSuggestedAuthor] = React.useState<Author | null>(null);

  React.useEffect(() => {
    getTrendingBlogs(3)
      .then((raw) => setRecommended(raw.map((b) => mapBlog(b, user.id || undefined))))
      .catch(() => setRecommended([]));

    searchAuthors("", { limit: 1 })
      .then(({ authors }) => setSuggestedAuthor(authors[0] ? mapAuthor(authors[0]) : null))
      .catch(() => setSuggestedAuthor(null));
  }, [user.id]);

  return (
    <aside className="hidden lg:flex flex-col gap-8 w-[340px] shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-accent-violet" />
          <h3 className="text-sm font-semibold text-text-primary">Recommended for you</h3>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {!recommended
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 py-3">
                  <Skeleton className="h-20 w-28 rounded-xl shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            : recommended.map((post) => <BlogCard key={post.id} post={post} variant="compact" />)}
        </div>
      </div>

      {suggestedAuthor && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Who to follow</h3>
          <AuthorCard author={suggestedAuthor} />
        </div>
      )}
    </aside>
  );
}
