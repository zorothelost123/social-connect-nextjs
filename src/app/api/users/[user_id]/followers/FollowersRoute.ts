import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { user_id: string } },
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("follows")
    .select("follower_id,created_at")
    .eq("following_id", params.user_id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ results: data });
}
