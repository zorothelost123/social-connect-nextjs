import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";

export async function POST(
  _request: Request,
  { params }: { params: { post_id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const supabase = createClient();
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", params.post_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id: params.post_id, user_id: userId });
    if (error) return jsonError(error.message, 400);
  }

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", params.post_id);

  return NextResponse.json({
    message: "Liked",
    liked: true,
    likes_count: count ?? 0,
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { post_id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const supabase = createClient();
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", params.post_id)
    .eq("user_id", userId);
  if (error) return jsonError(error.message, 400);

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", params.post_id);

  return NextResponse.json({
    message: "Unliked",
    liked: false,
    likes_count: count ?? 0,
  });
}
