"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to initiate checkout.");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-4 text-lg font-black text-white shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] hover:opacity-95 active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
    >
      {loading ? (
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
      ) : (
        <>
          <Zap className="h-5 w-5 fill-current" />
          Get SocialConnect Pro
        </>
      )}
    </button>
  );
}
