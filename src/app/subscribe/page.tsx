import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Crown, Zap, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout/logo";
import { SubscribeButton } from "@/components/subscription/subscribe-button";

export default async function SubscribePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  if (profile?.is_pro) {
    redirect("/feed");
  }

  const benefits = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      title: "Verified Badge",
      description: "Get a blue checkmark next to your name to show you are a trusted professional."
    },
    {
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      title: "AI Post Refiner",
      description: "Unlimited access to our Gemini-powered AI to perfect your social content."
    },
    {
      icon: <Zap className="h-5 w-5 text-blue-500" />,
      title: "Priority Reach",
      description: "Your posts get boosted in the feed for 2x more visibility."
    },
    {
      icon: <Crown className="h-5 w-5 text-primary" />,
      title: "Premium UI Customization",
      description: "Unlock exclusive themes and profile headers for your page."
    }
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fc] dark:bg-black flex flex-col items-center p-6">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-between mb-16 pt-4">
          <Link href="/feed" className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <h1 className="text-2xl font-bold">SocialConnect</h1>
          </Link>
          <Link href="/feed" className="text-sm font-semibold text-muted-foreground hover:text-primary">
            Back to Feed
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black tracking-tight leading-tight">
              Unlock the <span className="text-transparent bg-clip-text bg-brand-gradient">Next Level</span> of Professional Networking
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Join SocialConnect Pro and get the tools you need to stand out, create better content, and grow your network faster.
            </p>
            
            <div className="mt-10 space-y-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-card border border-border/50">
                    {benefit.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground leading-snug">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
             {/* Glow Effect */}
             <div className="absolute -inset-4 bg-brand-gradient opacity-20 blur-3xl rounded-[40px] -z-10" />
             
             <div className="rounded-[32px] border-4 border-white bg-white/70 p-10 premium-shadow backdrop-blur-xl dark:bg-card/70 dark:border-white/10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="inline-block rounded-full bg-brand-gradient-soft px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                      Most Popular
                    </span>
                    <h3 className="text-2xl font-black">SocialConnect Pro</h3>
                  </div>
                  <Crown className="h-8 w-8 text-primary" />
                </div>

                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black">$9.99</span>
                  <span className="text-muted-foreground font-semibold">/month</span>
                </div>

                <ul className="space-y-4 mb-10">
                  {["All premium features included", "No hidden fees", "Cancel anytime", "24/7 Priority support"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <SubscribeButton />
                
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  Secure payment via Stripe. Tax included if applicable.
                </p>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
