"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initial: {
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
    website: string | null;
    location: string | null;
    avatar_url: string | null;
  };
};

export function ProfileEditor({ initial }: Props) {
  const [form, setForm] = useState({
    first_name: initial.first_name ?? "",
    last_name: initial.last_name ?? "",
    bio: initial.bio ?? "",
    website: initial.website ?? "",
    location: initial.location ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  async function saveProfile() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to save profile.");
      setSaving(false);
      return;
    }
    setSaving(false);
    router.refresh();
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("avatar", file);

    const res = await fetch("/api/users/me/avatar", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Avatar upload failed.");
      setUploading(false);
      return;
    }
    setUploading(false);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h1 className="text-xl font-semibold">Edit Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Keep your profile clean and professional.
      </p>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <input
          value={form.first_name}
          onChange={(e) => setForm((s) => ({ ...s, first_name: e.target.value }))}
          placeholder="First name"
          className="rounded-xl border bg-background px-4 py-2.5"
        />
        <input
          value={form.last_name}
          onChange={(e) => setForm((s) => ({ ...s, last_name: e.target.value }))}
          placeholder="Last name"
          className="rounded-xl border bg-background px-4 py-2.5"
        />
      </div>

      <textarea
        value={form.bio}
        maxLength={160}
        onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
        placeholder="Bio (max 160 chars)"
        className="mt-3 h-24 w-full resize-none rounded-xl border bg-background px-4 py-2.5"
      />

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input
          value={form.website}
          onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
          placeholder="Website URL"
          className="rounded-xl border bg-background px-4 py-2.5"
        />
        <input
          value={form.location}
          onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))}
          placeholder="Location"
          className="rounded-xl border bg-background px-4 py-2.5"
        />
      </div>

      <div className="mt-4 space-y-2">
        <label className="text-sm font-medium">Avatar (JPEG/PNG, max 2MB)</label>
        <input
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadAvatar(file);
          }}
          className="block w-full text-sm"
        />
        {initial.avatar_url && (
          <p className="text-xs text-muted-foreground">Current avatar is set.</p>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <button
        onClick={saveProfile}
        disabled={saving || uploading}
        className="mt-5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-medium text-white disabled:opacity-70"
      >
        {uploading ? "Uploading avatar..." : saving ? "Saving..." : "Save changes"}
      </button>
    </section>
  );
}
