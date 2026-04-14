"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, SendHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PostComposer() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function refineWithAI() {
    if (!content.trim()) return;
    setIsRefining(true);
    try {
      const res = await fetch("/api/ai/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.refinedContent) {
        setContent(data.refinedContent);
        toast.success("Content refined with AI!");
      } else {
        toast.error(data.error || "AI refinement failed.");
      }
    } catch (err) {
      toast.error("AI refinement failed.");
    } finally {
      setIsRefining(false);
    }
  }

  async function onCreatePost() {
    if (!content.trim()) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("content", content);
    const selectedFile = fileRef.current?.files?.[0];
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    const res = await fetch("/api/posts", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not create post.");
      setLoading(false);
      return;
    }

    setContent("");
    if (fileRef.current) fileRef.current.value = "";
    setLoading(false);
    router.refresh();
  }

  return (
    <section className="rounded-3xl border bg-white p-5 premium-shadow dark:bg-card">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={280}
        placeholder="What's on your mind? Share it with the world..."
        className="h-32 w-full resize-none rounded-2xl border-none bg-muted/50 p-4 text-[15px] focus:ring-2 focus:ring-primary/20 dark:bg-black/40"
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="group flex cursor-pointer items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-accent hover:border-primary/30">
            <ImagePlus className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-muted-foreground group-hover:text-primary transition-colors">Media</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={refineWithAI}
            disabled={isRefining || !content.trim()}
            className="group flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition hover:bg-brand-gradient-soft hover:border-primary/30 disabled:opacity-50"
          >
            <Sparkles className={cn("h-4 w-4 text-primary group-hover:animate-pulse", isRefining && "animate-spin")} />
            <span className="text-muted-foreground group-hover:text-primary transition-colors">
              {isRefining ? "Refining..." : "AI Refine"}
            </span>
          </button>
        </div>
        <button
          onClick={onCreatePost}
          disabled={loading || !content.trim()}
          className="flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:opacity-90 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <SendHorizontal className="h-4 w-4" />
          )}
          {loading ? "Posting..." : "Share Post"}
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <div className="h-1.5 w-full max-w-[100px] overflow-hidden rounded-full bg-muted">
          <div 
            className="h-full bg-brand-gradient transition-all duration-300" 
            style={{ width: `${(content.length / 280) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          {error && <span className="text-rose-500 animate-pulse">{error}</span>}
          <span className={content.length > 250 ? "text-rose-500" : "text-muted-foreground"}>
            {content.length} / 280
          </span>
        </div>
      </div>
    </section>
  );
}
