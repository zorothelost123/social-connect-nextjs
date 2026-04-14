"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, Heart, MessageCircle, Send, Share2, Trash2, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  post: {
    id: string;
    author_id?: string;
    content: string;
    image_url: string | null;
    like_count: number;
    comment_count: number;
    created_at: string;
    profiles?: { username?: string; avatar_url?: string | null; is_pro?: boolean } | null;
  };
  initialLiked?: boolean;
  initialLikeCount?: number;
  initialCommentCount?: number;
  currentUserId?: string;
  allowDeletePost?: boolean;
};

type CommentItem = {
  id: string;
  author_id?: string;
  content: string;
  created_at: string;
  profiles?: { username?: string } | null;
};

export function PostCard({
  post,
  initialLiked = false,
  initialLikeCount,
  initialCommentCount,
  currentUserId,
  allowDeletePost = false,
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikeCount ?? post.like_count ?? 0);
  const [commentsCount, setCommentsCount] = useState(
    initialCommentCount ?? post.comment_count ?? 0,
  );
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`post_updates_${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `id=eq.${post.id}`,
        },
        (payload) => {
          if (payload.new.like_count !== undefined) {
            setLikesCount(payload.new.like_count);
          }
          if (payload.new.comment_count !== undefined) {
            setCommentsCount(payload.new.comment_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, supabase]);

  async function toggleLike() {
    const method = liked ? "DELETE" : "POST";
    const res = await fetch(`/api/posts/${post.id}/like`, { method });
    const data = await res.json();
    if (!res.ok) return;
    setLiked(Boolean(data.liked));
    setLikesCount(Number(data.likes_count ?? 0));
  }

  async function loadComments() {
    setLoadingComments(true);
    const res = await fetch(`/api/posts/${post.id}/comments`);
    const data = await res.json();
    if (res.ok) {
      setComments(data.results ?? []);
      setCommentsCount(Number(data.comments_count ?? data.results?.length ?? 0));
    }
    setLoadingComments(false);
  }

  async function onToggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments.length === 0) {
      await loadComments();
    }
  }

  async function addComment() {
    const content = commentText.trim();
    if (!content) return;

    const res = await fetch(`/api/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok) return;

    setCommentText("");
    setComments((prev) => [data.comment, ...prev]);
    setCommentsCount(Number(data.comments_count ?? commentsCount + 1));
    if (!commentsOpen) setCommentsOpen(true);
  }

  async function deleteComment(commentId: string) {
    const res = await fetch(`/api/posts/${post.id}/comments/${commentId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) return;
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setCommentsCount(Number(data.comments_count ?? Math.max(commentsCount - 1, 0)));
  }

  async function deletePost() {
    if (!allowDeletePost) return;
    setDeletingPost(true);
    const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      return;
    }
    setDeletingPost(false);
  }

  async function sharePost() {
    const postUrl = `/posts/${post.id}`;
    const absoluteUrl =
      typeof window !== "undefined" ? `${window.location.origin}${postUrl}` : postUrl;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Post by @${post.profiles?.username ?? "user"}`,
          text: post.content.slice(0, 120),
          url: absoluteUrl,
        });
        return;
      } catch {
        // ignore and fallback to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(absoluteUrl);
    }
  }

  return (
    <article className="group animate-fade-up rounded-[24px] border bg-white p-5 premium-shadow transition-all duration-300 hover:scale-[1.01] dark:bg-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 rounded-full bg-brand-gradient p-[2px]">
            <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-black">
              {post.profiles?.avatar_url ? (
                <Image
                  src={post.profiles.avatar_url}
                  alt="avatar"
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-xs font-bold text-muted-foreground">
                    {post.profiles?.username?.[0]?.toUpperCase() ?? "U"}
                  </span>
                </div>
              )}
            </div>
            {post.profiles?.is_pro && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm dark:bg-card">
                <Crown className="h-3 w-3 text-primary fill-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold tracking-tight">@{post.profiles?.username ?? "user"}</p>
              {post.profiles?.is_pro && <Crown className="h-3 w-3 text-primary fill-primary" />}
            </div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {allowDeletePost && (
            <button
              onClick={deletePost}
              disabled={deletingPost}
              className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={sharePost}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="mb-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
        {post.content}
      </p>

      {post.image_url && (
        <div className="relative mb-5 aspect-video overflow-hidden rounded-[16px] border bg-muted">
          <Image
            src={post.image_url}
            alt="post image"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-6">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={toggleLike}
            className={`flex items-center gap-2 text-sm font-semibold transition ${
              liked ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
            <span>{likesCount}</span>
          </motion.button>
          
          <button
            onClick={onToggleComments}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={sharePost}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-emerald-500"
          >
            <Send className="h-5 w-5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setSaved((v) => !v)}
          className={`rounded-full p-2 transition ${
            saved ? "bg-brand-gradient text-white shadow-lg" : "text-muted-foreground hover:bg-accent"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </motion.button>
      </div>

      {commentsOpen && (
        <div className="mt-5 space-y-4 rounded-2xl bg-muted/30 p-4 border border-border/50">
          <div className="flex gap-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 dark:bg-black"
            />
            <button
              onClick={addComment}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md transition hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {loadingComments ? (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-xs font-medium text-muted-foreground">No comments yet. Be the first to reply!</p>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-xl bg-white p-3 shadow-sm dark:bg-card border border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-bold text-primary">
                      @{comment.profiles?.username ?? "user"}
                    </p>
                    {comment.author_id === currentUserId && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[13px] leading-relaxed">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
