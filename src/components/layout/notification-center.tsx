"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Heart, MessageCircle, UserPlus, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "like" | "comment" | "follow" | "system";
  content: string | null;
  created_at: string;
  is_read: boolean;
  actor: {
    username: string;
    avatar_url: string | null;
  };
};

type NotificationRow = {
  id: string;
  type: Notification["type"];
  content: string | null;
  created_at: string;
  is_read: boolean;
  actor:
    | {
        username: string;
        avatar_url: string | null;
      }[]
    | {
        username: string;
        avatar_url: string | null;
      }
    | null;
};

export function NotificationCenter({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select(`
        id, type, content, created_at, is_read,
        actor:profiles!notifications_actor_id_fkey(username, avatar_url)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      const normalized = (data as NotificationRow[]).map((row) => ({
        id: row.id,
        type: row.type,
        content: row.content,
        created_at: row.created_at,
        is_read: row.is_read,
        actor: Array.isArray(row.actor)
          ? row.actor[0] ?? { username: "Someone", avatar_url: null }
          : row.actor ?? { username: "Someone", avatar_url: null },
      }));
      setNotifications(normalized);
      setUnreadCount(normalized.filter((n) => !n.is_read).length);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch the actor details for the new notification
          const { data: actorData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", payload.new.actor_id)
            .single();

          const newNotif: Notification = {
            id: payload.new.id,
            type: payload.new.type,
            content: payload.new.content,
            created_at: payload.new.created_at,
            is_read: payload.new.is_read,
            actor: actorData || { username: "Someone", avatar_url: null },
          };

          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications, userId, supabase]);

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-primary" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-emerald-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && markAsRead()}>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 group">
          <div className="relative">
            <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white shadow-sm"
                >
                  {unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          Notifications
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-80 rounded-[20px] border-none p-2 premium-shadow glass-sidebar dark:bg-card/90"
      >
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-sm font-bold">Recent Activity</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl p-3 focus:bg-accent/50",
                  !n.is_read && "bg-brand-gradient-soft/50"
                )}
              >
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background shadow-sm border border-border/50">
                  {getIcon(n.type)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[13px] leading-tight">
                    <span className="font-bold">@{n.actor.username}</span>{" "}
                    {n.type === "like" && "liked your post"}
                    {n.type === "comment" && `commented: "${n.content}"`}
                    {n.type === "follow" && "started following you"}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground uppercase font-medium">
                    {new Date(n.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
