import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { BackNavButton } from "@/components/layout/back-nav-button";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <section className="w-full rounded-3xl border bg-card p-8">
        <BackNavButton label="Back" />
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          Create your profile and start posting.
        </p>
        <AuthForm mode="register" />
        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-600">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
