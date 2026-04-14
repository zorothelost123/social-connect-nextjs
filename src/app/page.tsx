import Link from "next/link";
import { ArrowRight, Check, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { FloatingShowcase } from "@/components/landing/floating-showcase";
import { TrustStrip } from "@/components/landing/trust-strip";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden landing-mesh">
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <nav className="sticky top-4 z-20 mb-12 flex items-center justify-between rounded-2xl border bg-card/65 px-4 py-3 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-semibold">SocialConnect</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm hover:bg-accent">
              Login
            </Link>
            <Link href="/register" className="rounded-xl bg-brand-gradient px-4 py-2 text-sm text-white">
              Get Started
            </Link>
          </div>
        </nav>

        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="reveal-up">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-sm">
              <Sparkles className="h-4 w-4 text-brand-500" />
              Premium social experience
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Connect Without the
              <span className="bg-brand-gradient bg-clip-text text-transparent"> Clutter</span>
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Build your profile, post moments, like, comment, and discover people in
              a clean, modern, fast social app powered by Next.js + Supabase.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-primary/40"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/feed"
                className="rounded-xl border px-5 py-2.5 transition-all hover:-translate-y-0.5 hover:bg-accent"
              >
                Explore feed
              </Link>
            </div>
            <div className="mt-5 rounded-xl border bg-card/80 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">Demo mode for Loom</p>
              <p className="mt-1">
                Quick flow: register - update profile - create post - like/comment - follow from
                explore.
              </p>
            </div>
          </div>

          <FloatingShowcase />
        </div>

        <TrustStrip />

        <div className="reveal-up mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card/90 p-5 backdrop-blur">
            <Users className="mb-3 h-5 w-5 text-brand-500" />
            <h3 className="font-semibold">For creators</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create expressive posts with images and manage your social profile.
            </p>
          </div>
          <div className="rounded-2xl border bg-card/90 p-5 backdrop-blur md:col-span-2">
            <h3 className="font-semibold">How to start</h3>
            <ol className="mt-2 grid gap-2 text-sm text-muted-foreground">
              <li>1. Sign up with email and username</li>
              <li>2. Complete your profile and avatar</li>
              <li>3. Post, like, comment, and follow users from feed</li>
            </ol>
          </div>
          <div className="rounded-2xl border bg-card/90 p-5 backdrop-blur md:col-span-3">
            <h3 className="font-semibold">Core Highlights</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {[
                "JWT auth with protected routes",
                "Fast image posts with Supabase Storage",
                "Interactive likes/comments with live counts",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border p-3">
                  <Check className="mt-0.5 h-4 w-4 text-brand-500" />
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="reveal-up mt-12 rounded-2xl border bg-card/85 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold">SocialConnect</p>
              <p className="text-xs text-muted-foreground">
                Built for creators, teams, and communities.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Privacy First</span>
              <span>Performance Focused</span>
              <span>Cloud Native</span>
            </div>
          </div>
        </footer>
      </section>
    </main>
  );
}
