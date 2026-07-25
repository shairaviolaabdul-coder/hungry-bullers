"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AdminShell({
  adminEmail,
  children,
}: {
  adminEmail: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-black/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="leading-none">
          <p className="text-xs tracking-[0.25em] text-lime uppercase">
            Hungry Bullers
          </p>
          <p className="mt-1 text-[11px] tracking-widest text-white/40 uppercase">
            Admin Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[10rem] truncate text-xs text-white/50 sm:inline">
            {adminEmail}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="h-8 border border-white/20 px-3 text-xs font-semibold tracking-widest text-white/70 uppercase transition-colors hover:border-lime hover:text-lime disabled:opacity-40"
          >
            {signingOut ? "Signing out…" : "Sign Out"}
          </button>
        </div>
      </header>
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
