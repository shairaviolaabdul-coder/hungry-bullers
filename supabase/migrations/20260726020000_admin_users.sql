-- Admin allowlist. Being a valid Supabase Auth user is NOT enough to access
-- the admin dashboard — a row must also exist here, keyed by that user's
-- auth.users id. There is no public sign-up path that can insert into this
-- table (see RLS policy below and ADMIN_SETUP.md for how to add an admin).

create table public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Allowlist of Supabase Auth users permitted to access /admin. Rows are added manually via SQL — there is no app UI or API that can insert here.';

alter table public.admin_users enable row level security;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

-- A logged-in user may check ONLY their own row (used to decide whether to
-- show the admin dashboard or bounce to /admin/login). This never reveals
-- who else is an admin.
create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using (auth.uid() = id);
