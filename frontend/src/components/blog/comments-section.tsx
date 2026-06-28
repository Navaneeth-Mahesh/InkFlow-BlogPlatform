"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Send, Loader2, Trash2 } from "lucide-react";
import { InitialsAvatar } from "@/components/shared/initials-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Comment } from "@/types";
import { formatRelativeTime, cn, formatNumber } from "@/lib/utils";
import { useApp } from "@/hooks/use-app-state";
import { getBlogComments, addComment, deleteComment } from "@/lib/services/comment.service";
import { mapComment } from "@/lib/mappers";
import { toast } from "@/hooks/use-toast";
import { ApiClientError } from "@/lib/api-client";

export function CommentsSection({ postId }: { postId: string }) {
  const { user, isAuthenticated } = useApp();
  const [comments, setComments] = React.useState<Comment[] | null>(null);
  const [draft, setDraft] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    getBlogComments(postId, { limit: 50 })
      .then(({ comments: raw }) => {
        if (!cancelled) setComments(raw.map(mapComment));
      })
      .catch(() => {
        if (!cancelled) setComments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const totalCount = countComments(comments ?? []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    if (!isAuthenticated) {
      toast({ variant: "error", title: "Sign in to comment" });
      return;
    }
    setSubmitting(true);
    try {
      const raw = await addComment(postId, draft.trim());
      setComments((prev) => [mapComment(raw), ...(prev ?? [])]);
      setDraft("");
    } catch (err) {
      toast({ variant: "error", title: "Couldn't post comment", description: err instanceof ApiClientError ? err.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(commentId: string) {
    setComments((prev) => (prev ? prev.filter((c) => c.id !== commentId) : prev));
    deleteComment(commentId).catch(() => {
      toast({ variant: "error", title: "Couldn't delete comment" });
      getBlogComments(postId, { limit: 50 }).then(({ comments: raw }) => setComments(raw.map(mapComment))).catch(() => {});
    });
  }

  return (
    <section id="comments" className="pt-4">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-5 w-5 text-text-secondary" />
        <h2 className="font-display text-xl font-semibold text-text-primary">
          {comments === null ? "…" : totalCount} {totalCount === 1 ? "Comment" : "Comments"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
        <InitialsAvatar name={user.name || "?"} size="md" className="mt-0.5" />
        <div className="flex-1">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isAuthenticated ? "What did you think? Add to the discussion…" : "Sign in to join the discussion…"}
            disabled={!isAuthenticated}
            className="min-h-20"
          />
          <div className="flex justify-end mt-2.5">
            <Button type="submit" size="sm" disabled={!draft.trim() || submitting || !isAuthenticated} className="gap-1.5">
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {submitting ? "Posting…" : "Comment"}
            </Button>
          </div>
        </div>
      </form>

      {comments === null ? (
        <div className="flex justify-center py-10 text-text-tertiary text-sm">Loading comments…</div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-text-tertiary py-10">No comments yet — be the first to say something.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} currentUserId={user.id} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function countComments(comments: Comment[]): number {
  return comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);
}

function CommentItem({
  comment,
  isReply = false,
  currentUserId,
  onDelete,
}: {
  comment: Comment;
  isReply?: boolean;
  currentUserId: string;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = React.useState(!!comment.isLiked);
  const [likes, setLikes] = React.useState(comment.likes);
  const [replying, setReplying] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [localReplies, setLocalReplies] = React.useState(comment.replies ?? []);
  const { isAuthenticated } = useApp();

  const isOwner = currentUserId && comment.author.id === currentUserId;

  function toggleLike() {
    setLiked((l) => !l);
    setLikes((c) => (liked ? c - 1 : c + 1));
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!isAuthenticated) {
      toast({ variant: "error", title: "Sign in to reply" });
      return;
    }
    try {
      const raw = await addComment(comment.postId, replyText.trim(), comment.id);
      setLocalReplies((prev) => [...prev, { ...raw, postId: comment.postId } as never]);
      setReplyText("");
      setReplying(false);
    } catch {
      toast({ variant: "error", title: "Couldn't post reply" });
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("flex gap-3 py-5", isReply && "pl-12 pt-4 pb-0")}>
      <InitialsAvatar name={comment.author.name} size={isReply ? "sm" : "md"} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-primary">{comment.author.name}</span>
          <span className="text-xs text-text-tertiary">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-[14px] text-text-primary leading-relaxed mt-1.5">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2.5">
          <button onClick={toggleLike} className={cn("flex items-center gap-1.5 text-xs font-medium transition-colors", liked ? "text-accent-coral" : "text-text-tertiary hover:text-accent-coral")}>
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
            {likes > 0 && formatNumber(likes)}
          </button>
          {!isReply && (
            <button onClick={() => setReplying((r) => !r)} className="text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors">Reply</button>
          )}
          {isOwner && (
            <button onClick={() => onDelete(comment.id)} className="text-xs font-medium text-text-tertiary hover:text-accent-coral transition-colors flex items-center gap-1">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </div>

        <AnimatePresence>
          {replying && (
            <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={submitReply} className="overflow-hidden">
              <div className="flex gap-2 mt-3">
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Reply to ${comment.author.name}…`} className="min-h-14 text-sm" autoFocus />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" size="sm" variant="ghost" onClick={() => setReplying(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={!replyText.trim()}>Reply</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {localReplies.length > 0 && (
          <div className="flex flex-col divide-y divide-border mt-1">
            {localReplies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply currentUserId={currentUserId} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
