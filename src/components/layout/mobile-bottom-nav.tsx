"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Settings, UserRound } from "lucide-react";

type Props = {
  username?: string | null;
};

export function MobileBottomNav({ username }: Props) {
  const pathname = usePathname();

  const items = [
    { href: "/feed", label: "Feed", icon: Home },
    { href: "/explore", label: "Discover", icon: Search },
    { href: `/profile/${username ?? ""}`, label: "Profile", icon: UserRound },
    { href: "/settings/profile", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed inset-x-4 bottom-4 z-30 rounded-2xl border bg-card/95 p-2 shadow-xl backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`inline-flex flex-col items-center rounded-xl px-2 py-2 text-[11px] ${
                active
                  ? "bg-brand-gradient-soft text-brand-700 dark:text-brand-300"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
