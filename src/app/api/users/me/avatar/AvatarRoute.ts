import { NextResponse } from "next/server";
import { getCurrentUserId, jsonError } from "@/lib/api";
import { uploadImage } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const formData = await request.formData();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("Avatar file is required.", 422);
  }

  let avatarUrl = "";
  try {
    avatarUrl = await uploadImage(file, "avatars", supabase);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Avatar upload failed.",
      400,
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", userId)
    .select("id,username,avatar_url")
    .single();

  if (error) return jsonError(error.message, 400);
  return NextResponse.json(data);
}
