import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Home, MessageSquare, Settings, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout/logo";
import { NotificationCenter } from "@/components/layout/notification-center";
import { ChatInterface } from "@/components/messages/chat-interface";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

export default async function MessagesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 gap-0 lg:grid-cols-[20%_1fr] lg:p-6">
      {/* Sidebar - Desktop Only */}
      <aside className="glass-sidebar sticky top-6 hidden h-[calc(100vh-48px)] rounded-2xl border p-6 lg:flex flex-col">
        <div className="mb-8 flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <h1 className="text-xl font-bold tracking-tight">SocialConnect</h1>
        </div>

        <nav className="space-y-1">
          <Link href="/feed" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 group">
            <Home className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            Home
          </Link>
          
          <NotificationCenter userId={user.id} />

          <Link href="/messages" className="flex items-center gap-3 rounded-xl bg-brand-gradient px-4 py-3 text-sm font-medium text-white shadow-lg shadow-primary/20">
            <MessageSquare className="h-5 w-5" />
            Messages
          </Link>

          <Link href={`/profile/${profile?.username ?? ""}`} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 group">
            <UserRound className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            Profile
          </Link>
          <Link href="/settings/profile" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent/50 group">
            <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Messaging Area */}
      <section className="flex h-screen flex-col overflow-hidden bg-white lg:ml-6 lg:h-[calc(100vh-48px)] lg:rounded-3xl lg:border lg:premium-shadow dark:bg-card">
        {/* Mobile Header */}
        <div className="flex items-center gap-4 border-b p-4 lg:hidden">
          <Link href="/feed">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h2 className="text-lg font-bold">Messages</h2>
        </div>
        
        <ChatInterface currentUserId={user.id} />
      </section>

      <MobileBottomNav username={profile?.username} />
    </main>
  );
}
