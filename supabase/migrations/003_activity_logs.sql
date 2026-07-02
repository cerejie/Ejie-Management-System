-- Run this in the Supabase SQL editor on your existing project. Adds an
-- audit trail: every transaction create/edit/delete and every profile
-- role/status change gets logged automatically via triggers, so the log
-- can't be bypassed by going around the app's UI. Employee account
-- create/remove/register events are logged separately by their edge
-- functions (those run under the service role, outside a normal user
-- session, so there's no trigger-visible auth.uid() for them).

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

-- Transactions: log every insert/update/delete with whoever is making the
-- request (auth.uid()), not the transaction's created_by, since an admin
-- editing someone else's entry should be attributed to the admin.
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
