"use client";

import { useState } from "react";

type SuggestedUser = {
  id: string;
  username: string;
};

type Props = {
  users: SuggestedUser[];
  initiallyFollowing: string[];
};

export function SuggestedUsersWidget({ users, initiallyFollowing }: Props) {
  const [following, setFollowing] = useState<Record<string, boolean>>(
    Object.fromEntries(initiallyFollowing.map((id) => [id, true])),
  );

  async function toggleFollow(userId: string) {
    const isFollowing = Boolean(following[userId]);
    const res = await fetch(`/api/users/${userId}/follow`, {
      method: isFollowing ? "DELETE" : "POST",
    });
    if (!res.ok) return;
    setFollowing((prev) => ({ ...prev, [userId]: !isFollowing }));
  }

  return (
    <div className="mt-4 space-y-4">
      {users.map((user) => {
        const isFollowing = Boolean(following[user.id]);
        return (
          <div key={user.id} className="group flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/50 text-xs font-bold text-primary group-hover:bg-brand-gradient-soft group-hover:text-primary transition-colors">
                {user.username[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-bold">@{user.username}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Suggested for you</p>
              </div>
            </div>
            <button
              onClick={() => toggleFollow(user.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                isFollowing 
                ? "bg-accent text-muted-foreground hover:bg-destructive/10 hover:text-destructive" 
                : "bg-brand-gradient text-white shadow-md shadow-primary/20 hover:opacity-90"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        );
      })}
      {users.length === 0 && (
        <p className="text-center text-xs font-medium text-muted-foreground py-4">
          Looking for more connections...
        </p>
      )}
    </div>
  );
}
