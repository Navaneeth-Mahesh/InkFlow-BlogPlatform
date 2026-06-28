"use client";

import * as React from "react";
import { Reveal } from "@/components/shared/reveal";
import { AuthorCard } from "@/components/shared/author-card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchAuthors } from "@/lib/services";
import { mapAuthor } from "@/lib/mappers";
import { Author } from "@/types";

export function PopularAuthors() {
  const [authors, setAuthors] = React.useState<Author[] | null>(null);

  React.useEffect(() => {
    searchAuthors("", { limit: 4 })
      .then(({ authors: raw }) => setAuthors(raw.map((a) => mapAuthor(a))))
      .catch(() => setAuthors([]));
  }, []);

  if (authors && authors.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
      <Reveal>
        <p className="text-xs font-mono uppercase tracking-wider text-accent-violet mb-2">Worth following</p>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold text-text-primary tracking-tight mb-10">Popular authors on InkFlow</h2>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {!authors
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
          : authors.map((author, i) => (
              <Reveal key={author.id} delay={i * 0.08}>
                <AuthorCard author={author} />
              </Reveal>
            ))}
      </div>
    </section>
  );
}
