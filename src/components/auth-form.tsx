"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { mode: "login" | "register" };

export function AuthForm({ mode }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const payload = Object.fromEntries(formData.entries());
    const endpoint =
      mode === "register" ? "/api/auth/register" : "/api/auth/login";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/feed");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {mode === "register" && (
        <div className="grid grid-cols-2 gap-4">
          <input
            name="first_name"
            placeholder="First name"
            className="w-full rounded-2xl border-none bg-muted px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20"
          />
          <input
            name="last_name"
            placeholder="Last name"
            className="w-full rounded-2xl border-none bg-muted px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20"
          />
          <input
            required
            name="username"
            placeholder="Username"
            className="col-span-2 w-full rounded-2xl border-none bg-muted px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
      <input
        required
        name="email"
        type="email"
        placeholder="Email address"
        className="w-full rounded-2xl border-none bg-muted px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20"
      />
      <input
        required
        name="password"
        type="password"
        placeholder="Password"
        className="w-full rounded-2xl border-none bg-muted px-5 py-3.5 text-sm focus:ring-2 focus:ring-primary/20"
      />
      {error && <p className="text-sm font-semibold text-rose-500 animate-shake">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-brand-gradient px-6 py-4 text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Processing...</span>
          </div>
        ) : mode === "register" ? "Create Account" : "Log In"}
      </button>
    </form>
  );
}
