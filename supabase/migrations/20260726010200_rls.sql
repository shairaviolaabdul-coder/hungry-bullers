-- Row Level Security: deny-by-default.
--
-- Both tables get RLS enabled with ZERO policies for anon/authenticated.
-- That means no client (browser, app, or leaked anon key) can SELECT,
-- INSERT, UPDATE, or DELETE these tables directly — not even the order a
-- customer just placed. The only write path is the public.submit_order()
-- RPC (created in a later migration), which runs as SECURITY DEFINER and
-- therefore bypasses RLS internally under controlled, validated conditions.
--
-- Admin/back-office access is expected to use the Supabase service role key
-- from a trusted server context (never shipped to the browser), which
-- bypasses RLS entirely by design — no policies are needed for that here.

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Explicitly strip default table-level grants so RLS isn't the only layer.
revoke all on public.orders from anon, authenticated;
revoke all on public.order_items from anon, authenticated;
