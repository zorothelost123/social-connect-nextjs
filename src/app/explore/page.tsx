import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post-card";
import { BackNavButton } from "@/components/layout/back-nav-button";

type Props = {
  searchParams: { tag?: string };
};

type ExplorePost = {
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

export default async function ExplorePage({ searchParams }: Props) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const activeTag = searchParams.tag?.toLowerCase() ?? "";

  let query = supabase
    .from("posts")
    .select(
      "*, profiles!posts_author_id_fkey(username,avatar_url), likes(user_id), comments(id)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(30);

  if (activeTag) {
    query = query.ilike("content", `%#${activeTag}%`);
  }

  const { data: posts } = await query;

  const trending = ["nextjs", "reactnative", "typescript", "supabase"];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl space-y-4 p-4">
      <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
        <div className="flex items-center gap-3">
          <BackNavButton label="Back" />
          <h1 className="text-lg font-semibold">Explore</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {trending.map((tag) => (
            <Link
              key={tag}
              href={`/explore?tag=${tag}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                activeTag === tag ? "bg-primary text-white" : "hover:bg-accent"
              }`}
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {(posts ?? []).length === 0 ? (
        <section className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No posts found for this topic yet.
          </p>
        </section>
      ) : (
        ((posts ?? []) as ExplorePost[]).map((post) => (
          <PostCard
            key={post.id}
            post={post}
            initialLiked={(post.likes ?? []).some((like) => like.user_id === user.id)}
            initialLikeCount={post.likes?.length ?? 0}
            initialCommentCount={post.comments?.length ?? 0}
            currentUserId={user.id}
          />
        ))
      )}
    </main>
  );
}
