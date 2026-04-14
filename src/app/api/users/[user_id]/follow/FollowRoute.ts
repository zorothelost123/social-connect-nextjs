import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";

export async function POST(
  _request: Request,
  { params }: { params: { user_id: string } },
) {
  const followerId = await getCurrentUserId();
  if (!followerId) return jsonError("Unauthorized", 401);
  if (followerId === params.user_id) return jsonError("Cannot follow yourself", 400);

  const supabase = createClient();
  const { error } = await supabase
    .from("follows")
    .insert({ follower_id: followerId, following_id: params.user_id });

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ message: "Followed" });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { user_id: string } },
) {
  const followerId = await getCurrentUserId();
  if (!followerId) return jsonError("Unauthorized", 401);

  const supabase = createClient();
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", params.user_id);

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ message: "Unfollowed" });
}
