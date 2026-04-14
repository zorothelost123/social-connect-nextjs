import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const supabase = createClient();
  const { data: followingRows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  const followingIds = (followingRows ?? []).map((row) => row.following_id);
  const authorIds = [userId, ...followingIds];

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("is_active", true)
    .in("author_id", authorIds)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ results: data });
}
