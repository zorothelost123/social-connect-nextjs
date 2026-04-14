import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId, jsonError } from "@/lib/api";

const schema = z.object({
  bio: z.string().max(160).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().max(120).optional(),
  first_name: z.string().max(80).optional(),
  last_name: z.string().max(80).optional(),
});

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return jsonError("Unauthorized", 401);
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid profile payload", 422);
  }

  const supabase = createClient();
  const updates = { ...parsed.data };
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();

  if (error) {
    return jsonError(error.message, 400);
  }

  return NextResponse.json(data);
}

export const PUT = PATCH;
