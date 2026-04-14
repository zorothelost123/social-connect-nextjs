import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { post_id: string } },
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("id", params.post_id)
    .single();
  if (error) return jsonError(error.message, 404);
  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: { post_id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await request.json();
  const content = String(body.content ?? "").trim();
  if (!content || content.length > 280) return jsonError("Invalid content", 422);

  const supabase = createClient();
  const { data: ownPost } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", params.post_id)
    .single();
  if (!ownPost || ownPost.author_id !== userId) return jsonError("Forbidden", 403);

  const { data, error } = await supabase
    .from("posts")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", params.post_id)
    .select("*")
    .single();
  if (error) return jsonError(error.message, 400);
  return NextResponse.json(data);
}

export const PUT = PATCH;

export async function DELETE(
  _request: Request,
  { params }: { params: { post_id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const supabase = createClient();
  const { data: ownPost } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", params.post_id)
    .single();
  if (!ownPost || ownPost.author_id !== userId) return jsonError("Forbidden", 403);

  const { error } = await supabase
    .from("posts")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", params.post_id);
  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ message: "Deleted" });
}
