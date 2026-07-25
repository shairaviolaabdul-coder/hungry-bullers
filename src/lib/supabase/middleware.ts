import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session cookie on every request. This is an
 * optimistic layer only (per Next.js guidance) — it keeps sessions alive,
 * it does not decide who can see /admin. The real, authoritative check
 * happens server-side in src/lib/supabase/admin-guard.ts using
 * supabase.auth.getUser() (which re-validates the token with Supabase)
 * plus an admin_users lookup.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add logic between createServerClient and getUser() — see
  // Supabase's Next.js SSR guide for why (it can break session refresh).
  await supabase.auth.getUser();

  return supabaseResponse;
}
