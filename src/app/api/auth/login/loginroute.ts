import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api";
import { getAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().optional(),
  username: z.string().optional(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid login payload.", 422);
  }

  const supabase = createClient();
  const adminClient = getAdminClient();
  let email = parsed.data.email;

  if (!email && parsed.data.username) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", parsed.data.username)
      .single();
    if (!profile?.id) {
      return jsonError("Invalid username or password.", 401);
    }
    const { data: user } = await adminClient.auth.admin.getUserById(profile.id);
    email = user.user?.email;
  }

  if (!email) {
    return jsonError("Provide email or username.", 422);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return jsonError("Invalid credentials.", 401);
  }

  await supabase.from("profiles").update({}).eq("id", data.user.id);

  return NextResponse.json({ message: "Logged in.", user: data.user });
}
