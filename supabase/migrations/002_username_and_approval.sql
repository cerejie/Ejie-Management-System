-- Run this in the Supabase SQL editor on your EXISTING project (the one that
-- already ran schema.sql). It adds username-based login and an admin-approval
-- step for new accounts, without touching your existing admin row's data.
--
-- After running this, see the README section "Migrating an existing project
-- to username login" — your existing admin account's Supabase Auth email
-- still needs to be updated once via the dashboard for username login to work
-- for that specific account.

alter table public.profiles
  add column if not exists username text,
  add column if not exists status text not null default 'pending' check (status in ('pending', 'approved'));

-- Backfill a username for any rows created before this migration (there's
-- normally just your own founding admin account at this point).
update public.profiles
  set username = split_part(email, '@', 1)
  where username is null;

-- Existing admins are approved by definition.
update public.profiles set status = 'approved' where role = 'admin';

alter table public.profiles alter column username set not null;

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

-- Approval check, mirrors is_admin().
create or replace function public.is_approved(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and status = 'approved'
  );
$$;

-- New signups get a username from user metadata and stay 'pending' unless
-- they're the very first account (bootstrap admin).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username, full_name, role, status)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'full_name',
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'employee' end,
    case when (select count(*) from public.profiles) = 0 then 'approved' else 'pending' end
  );
  return new;
end;
$$;

-- Only approved accounts (or admins) may record transactions.
drop policy if exists "employees can insert their own transactions" on public.transactions;
drop policy if exists "approved employees can insert their own transactions" on public.transactions;
create policy "approved employees can insert their own transactions"
  on public.transactions for insert
  with check (
    created_by = auth.uid()
    and (public.is_approved(auth.uid()) or public.is_admin(auth.uid()))
  );
