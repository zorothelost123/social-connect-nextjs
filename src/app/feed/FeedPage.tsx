import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "@/components/post-composer";
import { PostCard } from "@/components/post-card";

export default async function FeedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username,bio,posts_count")
    .eq("id", user.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[240px_1fr_280px]">
      <aside className="hidden rounded-2xl border bg-card/70 p-4 backdrop-blur lg:block">
        <h2 className="text-lg font-semibold">SocialConnect</h2>
        <p className="mt-1 text-sm text-muted-foreground">@{profile?.username}</p>
        <Link
          href="/settings/profile"
          className="mt-4 inline-block rounded-xl border px-3 py-2 text-sm hover:bg-accent"
        >
          Edit profile
        </Link>
      </aside>
      <section className="space-y-4">
        <PostComposer />
        {(posts ?? []).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </section>
      <aside className="hidden rounded-2xl border bg-card p-4 lg:block">
        <h3 className="text-sm font-semibold">Profile Snapshot</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Posts: {profile?.posts_count ?? 0}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {profile?.bio ?? "Add your bio from profile settings."}
        </p>
      </aside>
    </main>
  );
}
