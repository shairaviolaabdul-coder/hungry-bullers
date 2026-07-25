-- Hungry Bullers merch ordering: core schema
-- Enums, tables, and defense-in-depth check constraints.

create extension if not exists "pgcrypto";

create type public.payment_status_enum as enum ('pending', 'verified', 'rejected');

create type public.order_status_enum as enum (
  'new',
  'preparing',
  'ready_for_pickup',
  'shipped',
  'completed',
  'cancelled'
);

create type public.fulfillment_method_enum as enum ('pickup', 'delivery');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  mobile_number text not null,
  messenger_name text,
  email text not null,
  fulfillment_method public.fulfillment_method_enum not null,
  delivery_address text,
  merchandise_subtotal numeric(10, 2) not null default 0 check (merchandise_subtotal >= 0),
  customization_total numeric(10, 2) not null default 0 check (customization_total >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  total_amount numeric(10, 2) not null default 0 check (total_amount >= 0),
  payment_reference text,
  payment_proof_path text not null,
  payment_status public.payment_status_enum not null default 'pending',
  order_status public.order_status_enum not null default 'new',
  customer_notes text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint delivery_requires_address check (
    fulfillment_method = 'pickup' or (delivery_address is not null and length(trim(delivery_address)) > 0)
  )
);

comment on table public.orders is 'Customer merchandise orders. No direct client access — writes only via public.submit_order().';
comment on column public.orders.internal_notes is 'Admin-only notes. Never returned by submit_order() or any client-facing RPC.';

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_name text not null,
  size text not null check (size in ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL')),
  quantity integer not null check (quantity between 1 and 20),
  player_name text,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  customization_price numeric(10, 2) not null default 0 check (customization_price >= 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);

comment on table public.order_items is 'Line items for an order. No direct client access — writes only via public.submit_order().';

-- keep updated_at current on any admin-side update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();
