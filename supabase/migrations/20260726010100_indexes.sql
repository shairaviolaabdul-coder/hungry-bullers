-- Indexes for admin lookups and reporting. order_number already has a
-- unique constraint (and therefore an index) from the previous migration.

create index idx_orders_created_at on public.orders (created_at desc);
create index idx_orders_payment_status on public.orders (payment_status);
create index idx_orders_order_status on public.orders (order_status);

create index idx_order_items_order_id on public.order_items (order_id);
