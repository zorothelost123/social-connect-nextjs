import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";
import { uploadImage } from "@/lib/storage";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("page_size") ?? "20");
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles!posts_author_id_fkey(username,avatar_url)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return jsonError(error.message, 400);
  return NextResponse.json({ results: data, page, page_size: pageSize });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return jsonError("Unauthorized", 401);

  const formData = await request.formData();
  const content = String(formData.get("content") ?? "").trim();
  if (!content || content.length > 280) {
    return jsonError("Content is required and max 280 characters.", 422);
  }

  let imageUrl: string | null = null;
  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      imageUrl = await uploadImage(image, "posts");
    } catch (error) {
      return jsonError(
        error instanceof Error ? error.message : "Image upload failed.",
        400,
      );
    }
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({ author_id: userId, content, image_url: imageUrl })
    .select("*")
    .single();
  if (error) return jsonError(error.message, 400);

  return NextResponse.json(data, { status: 201 });
}
