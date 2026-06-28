"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Author } from "@/types";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";
import { useApp } from "@/hooks/use-app-state";

export function AuthorCard({ author }: { author: Author }) {
  const { isFollowing, toggleFollow, user, registerAuthorFollowState } = useApp();
  const following = isFollowing(author.id);
  const isSelf = author.username === user.username;

  React.useEffect(() => {
    registerAuthorFollowState(author);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [author.id]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="flex flex-col items-center text-center rounded-2xl border border-border bg-surface p-6"
    >
      <Link href={`/profile/${author.username}`}>
        <InitialsAvatar name={author.name} size="lg" ringClassName="ring-4 ring-surface-sunken" />
      </Link>
      <Link href={`/profile/${author.username}`} className="mt-3 flex items-center gap-1 font-display font-semibold text-text-primary hover:text-accent-violet transition-colors">
        {author.name}
      </Link>
      <p className="text-xs text-text-tertiary mt-0.5">{author.role}</p>
      <p className="text-[13px] text-text-secondary mt-3 line-clamp-2 leading-relaxed">{author.bio}</p>
      <p className="text-xs text-text-tertiary mt-3 font-mono">{formatNumber(author.followers)} followers</p>
      {!isSelf && (
        <Button variant={following ? "secondary" : "outline"} size="sm" className="mt-4 w-full" onClick={() => toggleFollow(author.id, author.username)}>
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </motion.div>
  );
}
