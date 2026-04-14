"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type Props = {
  label?: string;
};

export function BackNavButton({ label = "Back" }: Props) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-accent"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
