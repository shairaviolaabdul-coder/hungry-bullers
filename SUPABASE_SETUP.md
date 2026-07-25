# Supabase Setup — Hungry Bullers

This project stores orders in Supabase Postgres and payment-proof
screenshots in Supabase Storage. This doc is everything you need to run,
from a blank Supabase project, to have order submission working.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for provisioning to finish, then open **Project Settings → API**.
3. Copy the **Project URL** and the **anon public** key.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` in the project root and fill in the two
values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env.local` is already gitignored. **Never** put the `service_role` key
anywhere in this project — it isn't needed (see "Why no service role key?"
below).

## 3. Run the SQL migrations

The SQL lives in `supabase/migrations/`, in the order it must run:

| File | What it does |
|---|---|
| `20260726010000_enums_and_tables.sql` | Creates the enums, `orders` and `order_items` tables, and constraints. |
| `20260726010100_indexes.sql` | Adds indexes for admin lookups (status, created_at, order_id). |
| `20260726010200_rls.sql` | Enables Row Level Security with **no policies** — deny-by-default for every client. |
| `20260726010300_storage.sql` | Creates the private `payment-proofs` bucket (5 MB limit, JPG/PNG/WEBP only) and an insert-only storage policy. |
| `20260726010400_order_number.sql` | Adds the atomic per-year order number counter and `generate_order_number()`. |
| `20260726010500_submit_order.sql` | Adds `submit_order()` — the only way an order can be created. |
| `20260726020000_admin_users.sql` | Admin allowlist table (see `ADMIN_SETUP.md`). |
| `20260726020100_is_admin.sql` | Helper used by RLS policies to check admin membership. |
| `20260726020200_admin_order_access.sql` | Grants admins read/limited-write access to orders. |
| `20260726020300_admin_storage_read.sql` | Lets admins generate signed URLs for payment proofs. |
| `20260726030000_no_delivery_fee.sql` | Redefines `submit_order()` with the delivery fee at ₱0 (delivery is free). |
| `20260726030100_admin_stats.sql` | Adds `get_admin_stats()` for dashboard KPI totals independent of pagination. |

### Option A — Supabase CLI (recommended)

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

This applies every file in `supabase/migrations/` in order.

### Option B — SQL Editor (manual)

If you don't want to install the CLI:

1. Open your project's **SQL Editor** in the Supabase dashboard.
2. Open each file in `supabase/migrations/` **in the order listed above**
   (the order matters — later files depend on earlier ones).
3. Paste the full contents of each file into a new query and click **Run**.
4. Repeat for all six files, in order.

## 4. Verify

In the Supabase dashboard:

- **Table Editor** → you should see `orders`, `order_items`, and
  `order_number_counters`, each with a shield icon indicating RLS is on.
- **Storage** → you should see a `payment-proofs` bucket marked **Private**.
- **Database → Functions** → you should see `submit_order` and
  `generate_order_number`.

Then run the app (`npm run dev`) and place a test order. You should get a
real order number back in the format `HB-2026-0001`. Check **Table Editor →
orders** to confirm the row (and its `order_items`) landed correctly.

## How the security model works

**Nothing about this app can read, edit, or browse orders or payment
proofs from the browser — by design, not by convention.**

- `orders` and `order_items` have RLS **enabled with zero policies**. That
  is a hard deny for every operation (`SELECT`/`INSERT`/`UPDATE`/`DELETE`)
  for the `anon` and `authenticated` roles, including reading the row a
  customer just created. Table-level grants to those roles are also
  explicitly revoked, so RLS isn't the only thing standing in the way.
- The **only** way a row gets into `orders`/`order_items` is the
  `submit_order()` Postgres function. It's `SECURITY DEFINER`, so it runs
  with the privileges of the function owner (bypassing RLS internally),
  but it re-validates every field itself — name, email format, phone
  format, fulfillment method, delivery address (required for delivery),
  size enum, quantity range, and item count — and **recomputes all prices
  from fixed constants** (₱360/shirt, ₱0 delivery fee, ₱0 name
  customization). A tampered client request cannot under-price an order or
  smuggle in extra fields.
- The `payment-proofs` storage bucket is **private** (no public read) and
  has exactly one policy: `anon`/`authenticated` may `INSERT` new objects
  under the `proofs/` folder. There is no `SELECT`, `UPDATE`, or `DELETE`
  policy for those roles, so nobody — not even the customer who uploaded
  it — can list, download, overwrite, or delete a payment screenshot from
  the browser. Filenames are randomized (`crypto.randomUUID()`), so paths
  aren't guessable either.
- Order numbers (`HB-2026-0001`) are generated atomically inside
  `generate_order_number()` using an `INSERT ... ON CONFLICT DO UPDATE
  ... RETURNING` upsert, which Postgres serializes per row — safe under
  concurrent submissions, no duplicate or skipped numbers.

### Why no service role key?

The `service_role` key bypasses RLS entirely and must never reach the
browser. This project has no code path that needs it: order creation goes
through `submit_order()`, which is safe to call with the public `anon` key
precisely because it's a `SECURITY DEFINER` function that validates its
own inputs. If you later build an admin dashboard to review/update orders
or view payment proofs, that dashboard should run its own server-side
Supabase client constructed with the service role key, loaded only from a
non-`NEXT_PUBLIC_` environment variable in a trusted server context (e.g.
a protected Route Handler or Server Component) — never in this app's
client bundle.

## Request flow

1. Browser validates the payment-proof file (type: JPG/PNG/WEBP, size ≤
   5 MB) and uploads it directly to the private `payment-proofs` bucket
   using the anon key (`src/lib/upload.ts`). This only works because of
   the insert-only storage policy — nothing else is possible with that
   key.
2. Browser calls `POST /api/orders` (`src/app/api/orders/route.ts`) with
   the order form data and the resulting storage path.
3. The Next.js Route Handler validates the payload with Zod
   (`src/lib/validation/order.ts`) and calls `supabase.rpc('submit_order',
   ...)` using a server-side Supabase client (`src/lib/supabase/server.ts`,
   still the anon key — no service role involved).
4. `submit_order()` re-validates everything in Postgres, computes totals,
   inserts the order and its line items, and returns the generated order
   number, which the UI shows on the confirmation screen.
