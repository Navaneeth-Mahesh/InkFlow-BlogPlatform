"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { Post } from "@/types";
import { Badge } from "@/components/ui/badge";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { LikeButton } from "@/components/shared/like-button";
import { BookmarkButton } from "@/components/shared/bookmark-button";
import { formatRelativeTime } from "@/lib/utils";

export function BlogCard({
  post,
  variant = "default",
  index = 0,
}: {
  post: Post;
  variant?: "default" | "compact" | "featured";
  index?: number;
}) {
  if (variant === "featured") return <FeaturedCard post={post} />;
  if (variant === "compact") return <CompactCard post={post} />;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative flex flex-col rounded-2xl border border-border bg-surface overflow-hidden h-full"
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />

      <div className="relative aspect-[16/10] overflow-hidden bg-surface-sunken">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl text-text-tertiary/40 select-none">Ink</span>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge variant="default" dotColor={post.category.color} className="backdrop-blur-md bg-white/85 dark:bg-black/55 border-none shadow-sm">
            {post.category.name}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-text-primary group-hover:text-accent-violet transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed line-clamp-2">{post.excerpt}</p>

        <div className="mt-4 flex items-center gap-2.5 relative z-20">
          <Link href={`/profile/${post.author.username}`} className="shrink-0">
            <InitialsAvatar name={post.author.name} size="xs" />
          </Link>
          <div className="min-w-0">
            <Link href={`/profile/${post.author.username}`} className="text-[13px] font-medium text-text-primary hover:text-accent-violet truncate block">
              {post.author.name}
            </Link>
          </div>
          <span className="text-text-tertiary text-xs">·</span>
          <span className="text-xs text-text-tertiary flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" /> {post.readTime} min
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between relative z-20">
          <span className="text-xs text-text-tertiary">{formatRelativeTime(post.publishedAt)}</span>
          <div className="flex items-center gap-3.5">
            <LikeButton post={post} size="sm" />
            <BookmarkButton post={post} size="sm" />
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function FeaturedCard({ post }: { post: Post }) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="group relative rounded-3xl overflow-hidden border border-border h-full min-h-[440px] flex flex-col justify-end bg-ink-900"
    >
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />
      <div className="absolute inset-0">
        {post.coverImage && (
          <Image src={post.coverImage} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 60vw" priority className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      </div>

      <div className="relative z-20 p-7 sm:p-9">
        <Badge variant="default" dotColor={post.category.color} className="backdrop-blur-md bg-white/15 text-white border-white/20">
          {post.category.name}
        </Badge>
        <h2 className="font-display text-2xl sm:text-[2rem] font-semibold leading-[1.15] text-white mt-4 max-w-xl">{post.title}</h2>
        <p className="mt-3 text-sm sm:text-[15px] text-white/75 leading-relaxed max-w-lg line-clamp-2">{post.excerpt}</p>
        <div className="mt-5 flex items-center gap-3 relative z-20">
          <InitialsAvatar name={post.author.name} size="sm" ringClassName="ring-2 ring-white/30" />
          <div>
            <p className="text-sm font-medium text-white">{post.author.name}</p>
            <p className="text-xs text-white/60">{formatRelativeTime(post.publishedAt)} · {post.readTime} min read</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CompactCard({ post }: { post: Post }) {
  return (
    <motion.article whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="group relative flex items-center gap-4 py-3">
      <Link href={`/blog/${post.slug}`} className="absolute inset-0 z-10" aria-label={post.title} />
      <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden shrink-0 bg-surface-sunken">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.title} fill sizes="80px" className="object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-sm text-text-tertiary/40">Ink</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide font-medium text-accent-violet mb-1">{post.category.name}</p>
        <h4 className="font-display text-[15px] font-semibold leading-snug text-text-primary group-hover:text-accent-violet transition-colors line-clamp-2">{post.title}</h4>
        <p className="text-xs text-text-tertiary mt-1.5">{post.author.name} · {formatRelativeTime(post.publishedAt)}</p>
      </div>
    </motion.article>
  );
}
