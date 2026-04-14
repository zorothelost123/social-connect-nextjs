import { Heart, MessageCircle, Send, Sparkles } from "lucide-react";

export function FloatingShowcase() {
  return (
    <div className="relative hidden h-[460px] w-full lg:block">
      <div className="float-slow absolute left-4 top-8 w-64 animate-fade-up rounded-2xl border bg-card/90 p-4 shadow-xl backdrop-blur">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
          <Sparkles className="h-3 w-3 text-brand-500" />
          Trending Post
        </p>
        <div className="h-28 rounded-xl bg-gradient-to-br from-brand-400/40 to-violet-500/30" />
        <p className="mt-3 text-sm font-medium">Design that feels alive.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Premium cards, smooth micro-interactions, and clean social flow.
        </p>
      </div>

      <div className="float-medium absolute right-8 top-24 w-72 animate-fade-up rounded-2xl border bg-card/95 p-4 shadow-xl [animation-delay:120ms] backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">@social_connect</p>
          <span className="rounded-full bg-brand-gradient-soft px-2 py-1 text-[11px]">
            Live
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Build, connect, and scale your network with a professional social
          product experience.
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" /> 2.4k
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" /> 390
          </span>
          <span className="inline-flex items-center gap-1">
            <Send className="h-3.5 w-3.5" /> Share
          </span>
        </div>
      </div>

      <div className="float-fast absolute bottom-8 left-20 w-80 animate-fade-up rounded-2xl border bg-card/85 p-4 shadow-xl [animation-delay:200ms] backdrop-blur">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Growth Snapshot
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg border p-2 text-center">
            <p className="text-xs text-muted-foreground">Creators</p>
            <p className="text-sm font-semibold">12K+</p>
          </div>
          <div className="rounded-lg border p-2 text-center">
            <p className="text-xs text-muted-foreground">Posts/day</p>
            <p className="text-sm font-semibold">8.6K</p>
          </div>
          <div className="rounded-lg border p-2 text-center">
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="text-sm font-semibold">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
