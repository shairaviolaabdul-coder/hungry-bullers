-- Grant admins (authenticated users present in admin_users) read access to
-- orders/order_items, and narrow write access to only the columns the
-- admin dashboard is allowed to change. Customers still have zero access —
-- these policies only apply to the `authenticated` role, and only take
-- effect for rows/actions where is_admin() is true.

create policy "admin_select_orders"
on public.orders
for select
to authenticated
using (public.is_admin());

create policy "admin_update_orders"
on public.orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "admin_select_order_items"
on public.order_items
for select
to authenticated
using (public.is_admin());

-- Column-level grants: even though the policy above allows UPDATE on the
-- orders row for admins, restrict which columns can actually be written.
-- Admins can verify/reject payment, move an order through its lifecycle,
-- and leave internal notes — they cannot rewrite prices, customer info, or
-- the order number from the dashboard's data layer.
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;
grant update (payment_status, order_status, internal_notes, updated_at)
  on public.orders to authenticated;
