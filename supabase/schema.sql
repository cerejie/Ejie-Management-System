-- Run this whole file once in the Supabase SQL editor (Project > SQL Editor > New query).
-- It sets up: profiles (linked 1:1 to auth.users), transactions (the money ledger),
-- an auto-provisioning trigger for new signups, and row level security for both roles.

-- 1. Profiles ----------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Helper used by policies below. security definer so it can read profiles
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

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- The very first account to register becomes admin automatically; everyone
-- after that defaults to employee. Promote/demote later from the Table
-- Editor (or an admin can do it from the in-app Employees page).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'employee' end
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

drop policy if exists "employees can insert their own transactions" on public.transactions;
create policy "employees can insert their own transactions"
  on public.transactions for insert
  with check (created_by = auth.uid());

drop policy if exists "owners and admins can view transactions" on public.transactions;
create policy "owners and admins can view transactions"
  on public.transactions for select
  using (created_by = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "only admins can update transactions" on public.transactions;
create policy "only admins can update transactions"
  on public.transactions for update
  using (public.is_admin(auth.uid()));

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
