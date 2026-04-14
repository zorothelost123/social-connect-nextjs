import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post-card";
import { Users } from "lucide-react";
import { BackNavButton } from "@/components/layout/back-nav-button";

type ProfilePost = {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  profiles?: { username?: string; avatar_url?: string | null } | null;
  likes?: { user_id: string }[];
  comments?: { id: string }[];
};

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "*, profiles!posts_author_id_fkey(username,avatar_url), likes(user_id), comments(id)",
    )
    .eq("author_id", profile.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  const isOwnProfile = user?.id === profile.id;
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id);
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <section className="rounded-2xl border bg-card p-4">
        <BackNavButton label="Back" />
        <h1 className="text-xl font-semibold">@{profile.username}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{profile.bio}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border p-2">
            <p className="text-xs text-muted-foreground">Posts</p>
            <p className="text-sm font-semibold">{posts?.length ?? 0}</p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="text-xs text-muted-foreground">Followers</p>
            <p className="text-sm font-semibold">{followersCount ?? 0}</p>
          </div>
          <div className="rounded-lg border p-2">
            <p className="text-xs text-muted-foreground">Following</p>
            <p className="text-sm font-semibold">{followingCount ?? 0}</p>
          </div>
        </div>
        {isOwnProfile && (
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            You can delete your posts from cards below.
          </p>
        )}
      </section>
      {((posts ?? []) as ProfilePost[]).map((post) => (
        <PostCard
          key={post.id}
          post={post}
          initialLiked={(post.likes ?? []).some((like) => like.user_id === user?.id)}
          initialLikeCount={post.likes?.length ?? 0}
          initialCommentCount={post.comments?.length ?? 0}
          currentUserId={user?.id}
          allowDeletePost={isOwnProfile}
        />
      ))}
    </main>
  );
}
