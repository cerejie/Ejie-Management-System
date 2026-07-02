-- Run this in the Supabase SQL editor on your existing project.
-- Lets an approved employee edit (but not delete) their own transactions —
-- previously only admins could update any transaction.

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
