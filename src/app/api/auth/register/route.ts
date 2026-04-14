import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { jsonError } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(6),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid register payload.", 422);
  }

  const supabase = createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
        first_name: parsed.data.first_name ?? "",
        last_name: parsed.data.last_name ?? "",
      },
    },
  });

  if (signUpError || !signUpData.user) {
    return jsonError(signUpError?.message ?? "Could not register user.", 400);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: signUpData.user.id,
    username: parsed.data.username,
    first_name: parsed.data.first_name ?? null,
    last_name: parsed.data.last_name ?? null,
  });

  if (profileError) {
    if (profileError.message.toLowerCase().includes("profiles_username_key")) {
      return jsonError("Username already exists. Try another username.", 409);
    }
    return jsonError(profileError.message, 400);
  }

  return NextResponse.json({
    message: "Registered successfully.",
    user: { id: signUpData.user.id, email: signUpData.user.email },
  });
}
