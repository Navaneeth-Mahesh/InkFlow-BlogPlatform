"use client";

import * as React from "react";
import { Author, Post } from "@/types";
import { mapAuthor } from "@/lib/mappers";
import { setAccessToken, refreshAccessToken, ApiClientError } from "@/lib/api-client";
import { loginUser, registerUser, logoutUser, getCurrentUser } from "@/lib/services/auth.service";
import { toggleLike as apiToggleLike } from "@/lib/services/like.service";
import { toggleBookmark as apiToggleBookmark } from "@/lib/services/bookmark.service";
import { toggleFollow as apiToggleFollow } from "@/lib/services/profile.service";
import { toast } from "@/hooks/use-toast";

const GUEST_USER: Author = {
  id: "",
  username: "",
  name: "Guest",
  bio: "",
  role: "Reader",
  followers: 0,
  following: 0,
  postsCount: 0,
  joinedAt: new Date().toISOString(),
};

interface AppState {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  user: Author;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleFollow: (authorId: string, username?: string) => void;
  isLiked: (postId: string) => boolean;
  isBookmarked: (postId: string) => boolean;
  isFollowing: (authorId: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  getLikeCount: (post: Post) => number;
  getBookmarkCount: (post: Post) => number;
  registerPostBaseline: (post: Post) => void;
  registerAuthorFollowState: (author: Author) => void;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);
  const [user, setUser] = React.useState<Author>(GUEST_USER);

  const [likedPostIds, setLikedPostIds] = React.useState<Set<string>>(new Set());
  const [bookmarkedPostIds, setBookmarkedPostIds] = React.useState<Set<string>>(new Set());
  const [followingIds, setFollowingIds] = React.useState<Set<string>>(new Set());

  const baselineLikes = React.useRef<Map<string, number>>(new Map());
  const [likeDeltas, setLikeDeltas] = React.useState<Map<string, number>>(new Map());

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await refreshAccessToken();
      if (!token) {
        if (!cancelled) setIsAuthLoading(false);
        return;
      }
      try {
        const rawUser = await getCurrentUser();
        if (cancelled) return;
        setUser(mapAuthor(rawUser));
        setIsAuthenticated(true);
        setFollowingIds(new Set(rawUser.following ?? []));
        setBookmarkedPostIds(new Set(rawUser.savedBlogs ?? []));
      } catch {
        setAccessToken(null);
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const { user: rawUser } = await loginUser({ email, password });
    setUser(mapAuthor(rawUser));
    setIsAuthenticated(true);
    setFollowingIds(new Set(rawUser.following ?? []));
    setBookmarkedPostIds(new Set(rawUser.savedBlogs ?? []));
  }, []);

  const register = React.useCallback(
    async (input: { name: string; username: string; email: string; password: string }) => {
      const { user: rawUser } = await registerUser(input);
      setUser(mapAuthor(rawUser));
      setIsAuthenticated(true);
    },
    []
  );

  const logout = React.useCallback(async () => {
    await logoutUser().catch(() => {});
    setUser(GUEST_USER);
    setIsAuthenticated(false);
    setLikedPostIds(new Set());
    setBookmarkedPostIds(new Set());
    setFollowingIds(new Set());
    setLikeDeltas(new Map());
  }, []);

  const requireAuthOrPrompt = React.useCallback(() => {
    if (!isAuthenticated) {
      toast({ variant: "error", title: "Sign in required", description: "Create a free account to do that." });
      return false;
    }
    return true;
  }, [isAuthenticated]);

  const toggleLike = React.useCallback(
    (postId: string) => {
      if (!requireAuthOrPrompt()) return;
      const wasLiked = likedPostIds.has(postId);

      setLikedPostIds((prev) => {
        const next = new Set(prev);
        wasLiked ? next.delete(postId) : next.add(postId);
        return next;
      });
      setLikeDeltas((prev) => {
        const next = new Map(prev);
        next.set(postId, (next.get(postId) ?? 0) + (wasLiked ? -1 : 1));
        return next;
      });

      apiToggleLike(postId).catch((err) => {
        setLikedPostIds((prev) => {
          const next = new Set(prev);
          wasLiked ? next.add(postId) : next.delete(postId);
          return next;
        });
        setLikeDeltas((prev) => {
          const next = new Map(prev);
          next.set(postId, (next.get(postId) ?? 0) + (wasLiked ? 1 : -1));
          return next;
        });
        toast({
          variant: "error",
          title: "Couldn't update like",
          description: err instanceof ApiClientError ? err.message : "Please try again.",
        });
      });
    },
    [likedPostIds, requireAuthOrPrompt]
  );

  const toggleBookmark = React.useCallback(
    (postId: string) => {
      if (!requireAuthOrPrompt()) return;
      const wasSaved = bookmarkedPostIds.has(postId);

      setBookmarkedPostIds((prev) => {
        const next = new Set(prev);
        wasSaved ? next.delete(postId) : next.add(postId);
        return next;
      });

      apiToggleBookmark(postId).catch((err) => {
        setBookmarkedPostIds((prev) => {
          const next = new Set(prev);
          wasSaved ? next.add(postId) : next.delete(postId);
          return next;
        });
        toast({
          variant: "error",
          title: "Couldn't update bookmark",
          description: err instanceof ApiClientError ? err.message : "Please try again.",
        });
      });
    },
    [bookmarkedPostIds, requireAuthOrPrompt]
  );

  const toggleFollow = React.useCallback(
    (authorId: string, username?: string) => {
      if (!requireAuthOrPrompt()) return;
      if (!username) return;
      const wasFollowing = followingIds.has(authorId);

      setFollowingIds((prev) => {
        const next = new Set(prev);
        wasFollowing ? next.delete(authorId) : next.add(authorId);
        return next;
      });

      apiToggleFollow(username).catch((err) => {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          wasFollowing ? next.add(authorId) : next.delete(authorId);
          return next;
        });
        toast({
          variant: "error",
          title: "Couldn't update follow status",
          description: err instanceof ApiClientError ? err.message : "Please try again.",
        });
      });
    },
    [followingIds, requireAuthOrPrompt]
  );

  const isLiked = React.useCallback((postId: string) => likedPostIds.has(postId), [likedPostIds]);
  const isBookmarked = React.useCallback(
    (postId: string) => bookmarkedPostIds.has(postId),
    [bookmarkedPostIds]
  );
  const isFollowing = React.useCallback(
    (authorId: string) => followingIds.has(authorId),
    [followingIds]
  );

  const registerPostBaseline = React.useCallback((post: Post) => {
    if (!baselineLikes.current.has(post.id)) baselineLikes.current.set(post.id, post.likes);
    if (post.isLiked) {
      setLikedPostIds((prev) => (prev.has(post.id) ? prev : new Set(prev).add(post.id)));
    }
    if (post.isBookmarked) {
      setBookmarkedPostIds((prev) => (prev.has(post.id) ? prev : new Set(prev).add(post.id)));
    }
  }, []);

  const registerAuthorFollowState = React.useCallback((author: Author) => {
    if (author.isFollowing) {
      setFollowingIds((prev) => (prev.has(author.id) ? prev : new Set(prev).add(author.id)));
    }
  }, []);

  const getLikeCount = React.useCallback(
    (post: Post) => {
      const baseline = baselineLikes.current.get(post.id) ?? post.likes;
      const delta = likeDeltas.get(post.id) ?? 0;
      return Math.max(0, baseline + delta);
    },
    [likeDeltas]
  );

  const getBookmarkCount = React.useCallback((post: Post) => post.bookmarks, []);

  const value: AppState = {
    isAuthenticated,
    isAuthLoading,
    user,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    isLiked,
    isBookmarked,
    isFollowing,
    login,
    register,
    logout,
    getLikeCount,
    getBookmarkCount,
    registerPostBaseline,
    registerAuthorFollowState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
