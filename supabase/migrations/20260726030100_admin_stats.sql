-- Server-side aggregate stats for the admin dashboard, so KPI totals (per
-- size, total shirts, verified revenue) reflect ALL orders even once the
-- dashboard's order list itself is paginated. Runs as SECURITY INVOKER
-- (the default) — the existing admin_select_orders/admin_select_order_items
-- RLS policies apply exactly as normal, so a non-admin caller just gets
-- zeros back rather than real data.

create or replace function public.get_admin_stats()
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'total_orders', (select count(*) from public.orders),
    'pending_payments', (select count(*) from public.orders where payment_status = 'pending'),
    'verified_revenue', (select coalesce(sum(total_amount), 0) from public.orders where payment_status = 'verified'),
    'total_shirts', (select coalesce(sum(quantity), 0) from public.order_items),
    'size_totals', (
      select coalesce(jsonb_object_agg(size, qty), '{}'::jsonb)
      from (
        select size, sum(quantity) as qty
        from public.order_items
        group by size
      ) t
    )
  );
$$;

revoke all on function public.get_admin_stats() from public;
grant execute on function public.get_admin_stats() to authenticated;
