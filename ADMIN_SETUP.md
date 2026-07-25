# Admin Dashboard Setup — `/admin`

## Authentication design (read this before creating an admin)

**Two independent gates, both required:**

1. **Supabase Auth** — the visitor must be a real, logged-in Supabase Auth
   user (email + password, checked via `supabase.auth.getUser()`, which
   re-validates the token against Supabase rather than trusting a decoded
   cookie).
2. **The `admin_users` allowlist** — being logged in is not enough. The
   user's `auth.users.id` must also exist as a row in `public.admin_users`.
   There is no button, form, or API route anywhere in this app that can
   insert into that table — it's only reachable via SQL you run yourself
   in the Supabase dashboard (see below). That's what "no public admin
   registration page" means in practice: signup as a concept doesn't
   exist here.

Both checks happen in `src/lib/supabase/admin-guard.ts`
(`getAdminSession()`), which is called:

- In `src/app/admin/(dashboard)/layout.tsx` — redirects to `/admin/login`
  before any dashboard UI renders.
- Again in `src/app/admin/(dashboard)/page.tsx` — belt-and-suspenders per
  Next.js's own auth guidance (checks in layouts alone aren't guaranteed to
  re-run on every navigation).
- In every `/api/admin/*` Route Handler (`requireAdminApi()`) — returns a
  plain `401` instead of redirecting, since these are called via `fetch`,
  not navigated to.

`src/proxy.ts` (Next.js 16's renamed `middleware.ts`) only refreshes the
Supabase session cookie on each request — it's explicitly **not** the
authorization boundary (Next's own docs warn against relying on
proxy/middleware alone for that). The real gate is always the server-side
`getUser()` + `admin_users` check above, which cannot be bypassed by
hitting a route directly, disabling JavaScript, or guessing the URL —
covering "do not secure it using only a hidden URL."

There is no password anywhere in this codebase. Supabase Auth owns
credential storage (hashed, managed by Supabase) entirely — this repo
never sees or stores a password.

### Database-level backup (defense in depth)

Even if the guard code above were somehow bypassed, the database itself
enforces the same rule:

- `orders`/`order_items` RLS policies for the `authenticated` role are
  gated on `public.is_admin()`, which checks the same `admin_users` table.
- Column-level grants mean even an authorized admin session can only ever
  update `payment_status`, `order_status`, and `internal_notes` on an
  order — never price fields, customer info, or the order number.
- The `payment-proofs` storage bucket only grants `SELECT` (needed for
  signed URLs) to `authenticated` users where `is_admin()` is true.

## How to create the first admin account

1. **Run the new migrations** (in addition to the six from the main
   Supabase setup), in order, via the SQL Editor:
   - `20260726020000_admin_users.sql`
   - `20260726020100_is_admin.sql`
   - `20260726020200_admin_order_access.sql`
   - `20260726020300_admin_storage_read.sql`
2. In the Supabase dashboard, go to **Authentication → Users → Add user**.
   Create the account with a real email and a strong password (or use
   "Send invite" if you'd rather they set their own password). Copy the
   generated **User UID**.
3. Back in the **SQL Editor**, run:

   ```sql
   insert into public.admin_users (id, email)
   values ('paste-the-user-uid-here', 'their-email@example.com');
   ```

4. That's it — that account can now sign in at `/admin/login`. Repeat step
   2–3 for each additional admin. To revoke access, just delete their row
   from `admin_users` (their Supabase Auth account can stay or be removed
   separately) — they'll be signed out of the admin dashboard on their
   next request.

## How unauthorized users are blocked

| Visitor | What happens |
|---|---|
| Not logged in, visits `/admin` | Server-side redirect to `/admin/login` before any dashboard data loads. |
| Logged in, but not in `admin_users` | Redirected to `/admin/login`; the login form itself also catches this case immediately after sign-in and signs them back out with "This account is not authorized for admin access." |
| Logged in admin, calls `/api/admin/*` directly | Works — session cookie is validated server-side. |
| Anyone without a session, calls `/api/admin/*` directly | `401 Unauthorized` JSON response, no data touched. |
| A request that somehow reaches Postgres without going through the guard | Still blocked — RLS policies re-check `is_admin()` independently of the application code. |

## Dashboard features

View, search (name / phone / order number), and filter (size, payment
status, order status) all orders; expand any order to see every line item,
customer/fulfillment details, and customer notes; verify or reject
payment; move an order through its status lifecycle; add/edit internal
notes; view the payment-proof screenshot via a temporary (2-minute) signed
URL; see totals ordered per size, total shirts ordered, and total revenue
from verified orders; export the currently filtered view to CSV. The
layout is card-based (not a fixed-width table), so it works on phone
screens as well as desktop.
