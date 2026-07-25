-- Helper used inside RLS policies to check "is the current authenticated
-- user an admin?" without repeating the admin_users EXISTS subquery
-- everywhere. SECURITY DEFINER so it works reliably regardless of the
-- calling policy's context.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users where id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
