import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/post-card";

export default async function PostDetailPage({
  params,
}: {
  params: { post_id: string };
}) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("id", params.post_id)
    .single();
  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("id,content,created_at")
    .eq("post_id", params.post_id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-4">
      <PostCard post={post} />
      <section className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Comments</h2>
        <div className="mt-3 space-y-2">
          {(comments ?? []).map((comment) => (
            <div key={comment.id} className="rounded-xl border p-3 text-sm">
              {comment.content}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
