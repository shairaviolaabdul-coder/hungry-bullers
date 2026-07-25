"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError || !data.user) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!adminRow) {
      await supabase.auth.signOut();
      setError("This account is not authorized for admin access.");
      setSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-5 text-white">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs tracking-[0.3em] text-lime uppercase">
          Hungry Bullers
        </p>
        <h1 className="font-display mt-2 text-center text-2xl tracking-wide text-white uppercase">
          Admin Sign In
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs tracking-[0.2em] text-white/50 uppercase">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full border border-white/15 bg-charcoal px-3 text-sm text-white outline-none transition-colors focus:border-lime"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs tracking-[0.2em] text-white/50 uppercase">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full border border-white/15 bg-charcoal px-3 text-sm text-white outline-none transition-colors focus:border-lime"
            />
          </label>

          {error && (
            <p className="border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full border border-lime bg-lime text-sm font-semibold tracking-[0.2em] text-black uppercase transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/30">
          Admin accounts are created directly by club administrators. There is
          no self-service sign-up.
        </p>
      </div>
    </div>
  );
}
