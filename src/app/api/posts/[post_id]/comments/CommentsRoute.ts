import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";

export async function GET(
  _request: Request,
  { params }: { params: { post_id: string } },
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles!comments_author_id_fkey(username,avatar_url)")
    .eq("post_id", params.post_id)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ results: data, comments_count: data?.length ?? 0 });
}

export async function POST(
  request: Request,
  { params }: { params: { post_id: string } },
) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await request.json();
  const content = String(body.content ?? "").trim();
  if (!content) return jsonError("Comment content is required.", 422);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: params.post_id, author_id: userId, content })
    .select("*, profiles!comments_author_id_fkey(username,avatar_url)")
    .single();
  if (error) return jsonError(error.message, 400);

  const { count } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("post_id", params.post_id);

  return NextResponse.json(
    { comment: data, comments_count: count ?? 0 },
    { status: 201 },
  );
}
