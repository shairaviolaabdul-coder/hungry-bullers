import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
};

/**
 * The single source of truth for "is this request an authorized admin?".
 * Uses supabase.auth.getUser() (validates the token against Supabase, not
 * just the cookie) and then checks the admin_users allowlist — being a
 * valid Supabase Auth account is not sufficient on its own.
 *
 * Memoized per request with React's cache() so calling it from a layout
 * and a page in the same render doesn't double-hit the database.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) return null;

  return { userId: user.id, email: user.email ?? "" };
});

/** For Server Components/pages: redirects unauthorized visitors to login. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

/** For Route Handlers: returns null instead of redirecting; caller returns 401/403 JSON. */
export async function requireAdminApi(): Promise<AdminSession | null> {
  return getAdminSession();
}
