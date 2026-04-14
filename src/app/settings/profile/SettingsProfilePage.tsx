import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/profile-editor";
import { BackNavButton } from "@/components/layout/back-nav-button";

export default async function SettingsProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,bio,website,location,avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-3xl p-4">
      <div className="mb-3">
        <BackNavButton label="Back" />
      </div>
      <ProfileEditor
        initial={{
          first_name: profile?.first_name ?? null,
          last_name: profile?.last_name ?? null,
          bio: profile?.bio ?? null,
          website: profile?.website ?? null,
          location: profile?.location ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }}
      />
    </main>
  );
}
