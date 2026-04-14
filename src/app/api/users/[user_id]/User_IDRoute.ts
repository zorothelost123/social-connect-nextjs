import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { user_id: string } },
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,username,first_name,last_name,bio,avatar_url,website,location,posts_count")
    .eq("id", params.user_id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}
