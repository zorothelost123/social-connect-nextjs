"use client";

import { useEffect, useState, useRef } from "react";
import {
  Send,
  Search,
  User,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  MessageSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  created_at: string;
  updated_at: string;
  participant_1: string;
  participant_2: string;
  other_participant: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  last_message?: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
};

export function ChatInterface({ currentUserId }: { currentUserId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id, created_at, updated_at, participant_1, participant_2
        `)
        .or(`participant_1.eq.${currentUserId},participant_2.eq.${currentUserId}`)
        .order("updated_at", { ascending: false });

      if (data) {
        const enrichedConversations = await Promise.all(
          data.map(async (conv) => {
            const otherId = conv.participant_1 === currentUserId ? conv.participant_2 : conv.participant_1;
            const { data: profile } = await supabase
              .from("profiles")
              .select("id, username, avatar_url")
              .eq("id", otherId)
              .single();

            // Get last message
            const { data: lastMsg } = await supabase
              .from("messages")
              .select("content")
              .eq("conversation_id", conv.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();

            return {
              ...conv,
              other_participant: profile || { id: otherId, username: "Unknown", avatar_url: null },
              last_message: lastMsg?.content,
            };
          })
        );
        setConversations(enrichedConversations);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [currentUserId, supabase]);

  // Fetch Messages for Active Conversation
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", activeConversation.id)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${activeConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          
          // Update last message in conversation list
          setConversations(prev => prev.map(c => 
            c.id === activeConversation.id 
            ? { ...c, last_message: payload.new.content, updated_at: payload.new.created_at }
            : c
          ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, supabase]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    const msg = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConversation.id,
      sender_id: currentUserId,
      content: msg,
    });

    if (!error) {
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversation.id);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Conversation List */}
      <div className={cn(
        "w-full border-r bg-background lg:w-80 lg:flex flex-col",
        activeConversation ? "hidden" : "flex"
      )}>
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search chats..."
              className="w-full rounded-xl bg-muted/50 py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className={cn(
                "flex w-full items-center gap-3 p-4 transition-colors hover:bg-accent/50",
                activeConversation?.id === conv.id && "bg-brand-gradient-soft border-r-2 border-primary"
              )}
            >
              <div className="h-12 w-12 shrink-0 rounded-full bg-muted overflow-hidden">
                {conv.other_participant.avatar_url ? (
                  <Image src={conv.other_participant.avatar_url} alt="avatar" width={48} height={48} className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-brand-gradient-soft text-primary font-bold">
                    {conv.other_participant.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-bold text-sm">@{conv.other_participant.username}</p>
                <p className="truncate text-xs text-muted-foreground">{conv.last_message || "No messages yet"}</p>
              </div>
              <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(conv.updated_at).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </div>
            </button>
          ))}
          {!loading && conversations.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No conversations yet. Start messaging from a profile!
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={cn(
        "flex flex-1 flex-col bg-accent/5",
        !activeConversation ? "hidden lg:flex items-center justify-center" : "flex"
      )}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b bg-white p-4 dark:bg-card">
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveConversation(null)} className="lg:hidden text-muted-foreground mr-2">
                   <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                  {activeConversation.other_participant.avatar_url ? (
                    <Image src={activeConversation.other_participant.avatar_url} alt="avatar" width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand-gradient text-white text-xs font-bold">
                      {activeConversation.other_participant.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold">@{activeConversation.other_participant.username}</p>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <Phone className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                <Video className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
                <MoreVertical className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === currentUserId;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id}
                    className={cn(
                      "flex max-w-[80%] flex-col",
                      isMe ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "rounded-[20px] px-4 py-2.5 text-sm shadow-sm",
                      isMe ? "bg-brand-gradient text-white rounded-tr-none" : "bg-white dark:bg-card rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="mt-1 text-[9px] text-muted-foreground uppercase font-medium tracking-tighter">
                      {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t dark:bg-card">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-muted-foreground px-2">
                  <Smile className="h-5 w-5 cursor-pointer hover:text-primary" />
                  <Paperclip className="h-5 w-5 cursor-pointer hover:text-primary" />
                </div>
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 rounded-2xl bg-muted/50 px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="submit"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-20 w-20 rounded-full bg-brand-gradient-soft flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-primary animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Your Messages</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Select a conversation or start a new one to connect with your professional network.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronLeftIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
