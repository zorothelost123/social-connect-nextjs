import { redirect } from "next/navigation";
import Link from "next/link";
import { Compass, Home, MessageSquare, Settings, UserRound, Crown } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "@/components/post-composer";
import { PostCard } from "@/components/post-card";
import { Logo } from "@/components/layout/logo";
import { SuggestedUsersWidget } from "@/components/feed/suggested-users-widget";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { LogoutActionButton } from "@/components/layout/logout-action-button";
import { NotificationCenter } from "@/components/layout/notification-center";

type FeedPost = {
  id: string;
  content: string;
  image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles?: { username?: string; avatar_url?: string | null; is_pro?: boolean } | null;
  likes?: { user_id: string }[];
  comments?: { id: string }[];
};

export default async function FeedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,bio,posts_count,avatar_url,is_pro")
    .eq("id", user.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "*, profiles!posts_author_id_fkey(username,avatar_url,is_pro), likes(user_id), comments(id)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: followingRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", user.id);
  const followingIds = (followingRows ?? []).map((row) => row.following_id);
  const followingCount = followingIds.length;

  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", user.id);

  const { data: suggestedUsers } = await supabase
    .from("profiles")
    .select("id,username,is_pro")
    .neq("id", user.id)
    .limit(6);
//comment is addedd
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 gap-6 p-6 pb-24 lg:grid-cols-[20%_1fr_30%] lg:pb-6">
      <aside className="glass-sidebar sticky top-6 hidden h-fit rounded-2xl border p-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-brand-gradient">SocialConnect</h1>
        </div>
        
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="relative h-10 w-10 rounded-full bg-brand-gradient p-[2px]">
            <div className="h-full w-full overflow-hidden rounded-full bg-white dark:bg-black flex items-center justify-center">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="profile avatar"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold uppercase">{profile?.username?.[0]}</span>
              )}
            </div>
            {profile?.is_pro && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <Crown className="h-3 w-3 text-primary fill-primary" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold">@{profile?.username}</p>
              {profile?.is_pro && <Crown className="h-3 w-3 text-primary fill-primary" />}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{profile?.bio || "SocialConnect user"}</p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link href="/feed" className="flex items-center gap-3 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-medium text-white shadow-lg shadow-primary/20">
            <Home className="h-5 w-5" />
            Home
          </Link>
          
          <NotificationCenter userId={user.id} />

          <Link href="/messages" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 group">
            <MessageSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            Messages
          </Link>

          <Link href={`/profile/${profile?.username ?? ""}`} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 group">
            <UserRound className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            Profile
          </Link>

          {!profile?.is_pro && (
            <Link href="/subscribe" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-primary animate-pulse hover:bg-brand-gradient-soft transition-all">
              <Crown className="h-5 w-5 fill-primary" />
              Upgrade to Pro
            </Link>
          )}

          <Link href="/settings/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 group">
            <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            Settings
          </Link>
        </nav>

        <div className="mt-auto pt-8">
          <LogoutActionButton />
        </div>
      </aside>

      <section className="space-y-6">
        <div className="sticky top-6 z-20 flex h-14 items-center justify-between rounded-2xl border bg-white/70 px-6 backdrop-blur dark:bg-black/70 shadow-sm">
          <h2 className="text-base font-semibold">Home Feed</h2>
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        
        <PostComposer />
        
        <div className="space-y-6">
          {((posts ?? []) as FeedPost[]).map((post) => {
            const likedByMe = (post.likes ?? []).some((like) => like.user_id === user.id);
            return (
              <PostCard
                key={post.id}
                post={post}
                initialLiked={likedByMe}
                initialLikeCount={post.likes?.length ?? 0}
                initialCommentCount={post.comments?.length ?? 0}
                currentUserId={user.id}
              />
            );
          })}
        </div>
      </section>

      <aside className="sticky top-6 hidden h-fit space-y-6 lg:block">
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Your Profile</h3>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold">{profile?.posts_count ?? 0}</p>
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold">{followersCount ?? 0}</p>
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold">{followingCount}</p>
              <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">Following</p>
            </div>
          </div>
          {profile?.bio && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed italic">
              &ldquo;{profile?.bio}&rdquo;
            </p>
          )}
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Who to follow</h3>
            <Link href="/explore" className="text-xs font-semibold text-primary hover:underline">See all</Link>
          </div>
          <SuggestedUsersWidget
            users={(suggestedUsers ?? []).map((item) => ({
              id: item.id,
              username: item.username,
            }))}
            initiallyFollowing={followingIds}
          />
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-card">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Trending Topics</h3>
          <div className="mt-4 space-y-4">
            {[
              { tag: "#nextjs", count: "1.2k posts" },
              { tag: "#reactnative", count: "850 posts" },
              { tag: "#typescript", count: "500 posts" },
            ].map((trend) => (
              <Link
                key={trend.tag}
                href={`/explore?tag=${encodeURIComponent(trend.tag.replace("#", ""))}`}
                className="group block"
              >
                <p className="text-sm font-semibold transition-colors group-hover:text-primary">{trend.tag}</p>
                <p className="text-xs text-muted-foreground">{trend.count}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-brand-gradient-soft p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-primary">
              <Compass className="h-4 w-4" />
              Explore next
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Follow more users to discover personalized content.
            </p>
          </div>
        </div>
      </aside>

      <MobileBottomNav username={profile?.username} />
    </main>
  );
}
