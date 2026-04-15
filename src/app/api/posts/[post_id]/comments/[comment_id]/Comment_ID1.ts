import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";

export async function DELETE(
  _request: Request,
  { params }: { params: { post_id: string; comment_id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const supabase = createClient();
  const { data: comment } = await supabase
    .from("comments")
    .select("author_id")
    .eq("id", params.comment_id)
    .eq("post_id", params.post_id)
    .single();
  if (!comment || comment.author_id !== userId) return jsonError("Forbidden", 403);

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", params.comment_id)
    .eq("post_id", params.post_id);
  if (error) return jsonError(error.message, 400);

  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", params.post_id);

  return NextResponse.json({ message: "Deleted", comments_count: count ?? 0 });
}
