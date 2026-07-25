-- Atomic, per-year order number sequence: HB-2026-0001, HB-2026-0002, ...

create table public.order_number_counters (
  year integer primary key,
  last_value integer not null default 0
);

revoke all on public.order_number_counters from anon, authenticated;
alter table public.order_number_counters enable row level security;

create or replace function public.generate_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_year int := extract(year from now())::int;
  v_next int;
begin
  insert into public.order_number_counters (year, last_value)
  values (v_year, 1)
  on conflict (year) do update
    set last_value = public.order_number_counters.last_value + 1
  returning last_value into v_next;

  return 'HB-' || v_year::text || '-' || lpad(v_next::text, 4, '0');
end;
$$;

revoke all on function public.generate_order_number() from public;
