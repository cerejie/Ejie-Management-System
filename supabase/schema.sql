-- Run this whole file once in the Supabase SQL editor (Project > SQL Editor > New query).
-- It sets up: profiles (linked 1:1 to auth.users), transactions (the money ledger),
-- an auto-provisioning trigger for new signups, and row level security for both roles.
--
-- Login is username-based: the app maps a username to a synthetic email
-- (username@users.moneytracker.local) under the hood, since Supabase Auth's
-- password flow is email-shaped. See src/lib/auth-helpers.ts.
--
-- New signups default to role='employee', status='pending' and can't do
-- anything until an admin approves them from the Employees page — except the
-- very first account ever created, which becomes an approved admin
-- automatically (that's how you bootstrap the system).

-- 1. Profiles ----------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  username text not null,
  full_name text,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

alter table public.profiles enable row level security;

-- Helpers used by policies below. security definer so they can read profiles
-- without recursing through the profiles RLS policy itself.
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = uid and role = 'admin'
  );
$$;

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

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- The very first account to register becomes an approved admin automatically;
-- everyone after that defaults to employee + pending, until an admin approves
-- them from the in-app Employees page.
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop policy if exists "profiles are viewable by the owner or an admin" on public.profiles;
create policy "profiles are viewable by the owner or an admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin(auth.uid()));

drop policy if exists "profiles are editable by the owner or an admin" on public.profiles;
create policy "profiles are editable by the owner or an admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin(auth.uid()));

-- 2. Transactions -------------------------------------------------------------

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('deposit', 'deduction')),
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_created_by_idx on public.transactions (created_by);
create index if not exists transactions_created_at_idx on public.transactions (created_at desc);

alter table public.transactions enable row level security;

-- Only approved accounts (or admins) may record transactions.
drop policy if exists "employees can insert their own transactions" on public.transactions;
drop policy if exists "approved employees can insert their own transactions" on public.transactions;
create policy "approved employees can insert their own transactions"
  on public.transactions for insert
  with check (
    created_by = auth.uid()
    and (public.is_approved(auth.uid()) or public.is_admin(auth.uid()))
  );

drop policy if exists "owners and admins can view transactions" on public.transactions;
create policy "owners and admins can view transactions"
  on public.transactions for select
  using (created_by = auth.uid() or public.is_admin(auth.uid()));

-- Approved employees can edit their own entries; admins can edit any entry.
-- Deleting is still admin-only (see below).
drop policy if exists "only admins can update transactions" on public.transactions;
drop policy if exists "owners and admins can update transactions" on public.transactions;
create policy "owners and admins can update transactions"
  on public.transactions for update
  using (
    (created_by = auth.uid() and public.is_approved(auth.uid()))
    or public.is_admin(auth.uid())
  )
  with check (
    (created_by = auth.uid() and public.is_approved(auth.uid()))
    or public.is_admin(auth.uid())
  );

drop policy if exists "only admins can delete transactions" on public.transactions;
create policy "only admins can delete transactions"
  on public.transactions for delete
  using (public.is_admin(auth.uid()));

-- Keep updated_at current on edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.set_updated_at();

-- 3. Activity logs --------------------------------------------------------
--
-- Every transaction create/edit/delete and every profile role/status change
-- is logged automatically via triggers below, so the log can't be bypassed
-- by going around the app's UI. Employee account create/remove/register
-- events are logged separately by their edge functions (those run under the
-- service role, outside a normal user session, so there's no
-- trigger-visible auth.uid() for them).

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists "only admins can view activity logs" on public.activity_logs;
create policy "only admins can view activity logs"
  on public.activity_logs for select
  using (public.is_admin(auth.uid()));

create or replace function public.log_transaction_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_logs (actor_id, action, details)
    values (auth.uid(), 'transaction.create', jsonb_build_object(
      'transaction_id', new.id, 'type', new.type, 'amount', new.amount
    ));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.activity_logs (actor_id, action, details)
    values (auth.uid(), 'transaction.update', jsonb_build_object(
      'transaction_id', new.id,
      'before', jsonb_build_object('type', old.type, 'amount', old.amount, 'note', old.note),
      'after', jsonb_build_object('type', new.type, 'amount', new.amount, 'note', new.note)
    ));
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.activity_logs (actor_id, action, details)
    values (auth.uid(), 'transaction.delete', jsonb_build_object(
      'transaction_id', old.id, 'type', old.type, 'amount', old.amount
    ));
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists log_transaction_insert on public.transactions;
create trigger log_transaction_insert
  after insert on public.transactions
  for each row execute procedure public.log_transaction_change();

drop trigger if exists log_transaction_update on public.transactions;
create trigger log_transaction_update
  after update on public.transactions
  for each row execute procedure public.log_transaction_change();

drop trigger if exists log_transaction_delete on public.transactions;
create trigger log_transaction_delete
  after delete on public.transactions
  for each row execute procedure public.log_transaction_change();

-- Profiles: log role changes and approvals (skip no-op updates).
create or replace function public.log_profile_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    insert into public.activity_logs (actor_id, action, details)
    values (auth.uid(), 'employee.role_change', jsonb_build_object(
      'target_id', new.id, 'username', new.username, 'from', old.role, 'to', new.role
    ));
  end if;
  if new.status is distinct from old.status then
    insert into public.activity_logs (actor_id, action, details)
    values (auth.uid(), 'employee.approve', jsonb_build_object(
      'target_id', new.id, 'username', new.username, 'from', old.status, 'to', new.status
    ));
  end if;
  return new;
end;
$$;

drop trigger if exists log_profile_update on public.profiles;
create trigger log_profile_update
  after update on public.profiles
  for each row execute procedure public.log_profile_change();
