import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { BackNavButton } from "@/components/layout/back-nav-button";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <section className="w-full rounded-[32px] border bg-white p-10 premium-shadow dark:bg-card">
        <BackNavButton label="Back" />
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
        <p className="mt-2 mb-8 text-[15px] text-muted-foreground leading-relaxed">
          Log in to reconnect with your professional community and explore what&apos;s new.
        </p>
        <AuthForm mode="login" />
        <p className="mt-8 text-center text-sm font-medium text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Join now
          </Link>
        </p>
      </section>
    </main>
  );
}
