# Money Tracker

Internal admin/employee tool for tracking cash in and out. Employees record "Money In" /
"Money Out" entries; admins see the full ledger, current balance, can edit or delete any
entry, and manage employee accounts.

## Stack

- React 19 + TypeScript + Vite
- Ant Design 6 (UI), vanilla-extract (layout/theme tokens)
- TanStack Router (code-based routes, role-guarded)
- react-hook-form + zod for form validation
- zustand for auth/session state
- Supabase (Postgres + Auth) as the backend
- vite-plugin-pwa for installability

## How accounts work

Login is **name + username + password only** — there's no email field anywhere in the UI or
sign-in flow, and **no email is ever sent** by this app. There are two ways to get an account:

- **Self-register** at `/register` (name, username, password). New accounts start out
  `pending`. Signing in with a pending account is rejected outright (with a clear "not
  approved yet" message) until an admin approves them from the **Employees** page — there's
  no partial/limited session for pending users, they simply can't get in.
- **Admin-created**, from the **Employees** page — approved immediately, no waiting.

Supabase Auth's password flow is still email-shaped internally, so accounts get a synthetic,
non-deliverable email under the hood (`username@users.moneytracker.local`, see
[auth-helpers.ts](src/lib/auth-helpers.ts)). Both registration paths create the account
through the **Admin API** (`auth.admin.createUser` with `email_confirm: true`) rather than
Supabase's public sign-up flow — that's deliberate: the public flow tries to actually send a
confirmation email even to a synthetic address, which reliably runs into Supabase's
email-sending rate limit on small/free projects. The Admin API path never sends mail at all,
so there's no "confirm email" setting to get right and no rate limit to hit. After the account
is created, the app signs the user in normally with their password (sign-in never sends mail
either).

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor** and run the entire contents of [supabase/schema.sql](supabase/schema.sql).
   This creates the `profiles`, `transactions`, and `activity_logs` tables, row-level
   security policies, and the triggers that write to `activity_logs` automatically whenever
   a transaction or a profile's role/status changes.
   - Already ran an older version of this file on a live project? Don't re-run all of
     `schema.sql` — instead run the migration(s) in [supabase/migrations](supabase/migrations)
     you haven't applied yet, in order (each one is idempotent and safe to re-run).
3. In **Project Settings > API**, copy the **Project URL** and **anon public** key (for the
   app's `.env`) and the **service_role** key (secret — only used once, locally, for step 3).

## 2. Deploy the edge functions

Every account (self-registered or admin-created) goes through a server-side function that
uses the service-role key — which must never reach the browser, hence the separate function
instead of calling the Admin API from the client.

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>   # the ref is in your project URL
npx supabase functions deploy register-employee
npx supabase functions deploy create-employee
npx supabase functions deploy delete-employee
```

No extra secrets to configure — Supabase automatically provides `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to every deployed edge function.
`register-employee` is intentionally callable by anyone (that's what powers `/register`);
`create-employee` and `delete-employee` re-check (via RLS) that the caller is really an admin
before doing anything, so they're safe even though they're public endpoints.

## 3. Bootstrap the first admin account

The Employees page needs an existing admin to use it, so the very first account has to be
created differently — with a one-off script using your **service_role** key (never put this
key in the app or commit it anywhere).

```bash
node scripts/bootstrap-admin.mjs <username> <password>
```

See [scripts/bootstrap-admin.mjs](scripts/bootstrap-admin.mjs) — it prompts for nothing else,
just prints the Supabase URL/service key it needs as env vars:

```bash
SUPABASE_URL=https://<your-project-ref>.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
node scripts/bootstrap-admin.mjs myusername "a-strong-password"
```

This creates the user via the Admin API directly and marks the resulting profile
`role=admin`. Run it once; after that, log in at `/login`. Every other account can either
self-register at `/register` (and wait for your approval) or be created directly from the
Employees page.

## 4. Configure the app

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (the **anon public** key, not the
service role key — that one never goes here).

## 5. Install and run

```bash
npm install
npm run dev
```

Log in with the account you created in step 3, then add employees from the **Employees** page.

## Roles

| Action                         | Employee (pending) | Employee (approved) | Admin |
| ------------------------------- | :---: | :---: | :---: |
| Log in                         | ✅ | ✅ | ✅ |
| Add a "Money In" / "Money Out" entry | ❌ | ✅ | ✅ |
| View own entries + own balance | ❌ | ✅ | ✅ (all) |
| Edit own entries               | ❌ | ✅ | ✅ (any) |
| Delete any entry               | ❌ | ❌ | ✅ |
| Approve pending accounts, create/remove accounts, promote/demote roles | ❌ | ❌ | ✅ |
| View activity logs             | ❌ | ❌ | ✅ |

All of this is enforced both in the UI and via Postgres row-level security (see
[supabase/schema.sql](supabase/schema.sql)), so the rules hold even if someone calls the
Supabase API directly.

## Activity logs

The **Logs** page (admin-only) shows every transaction create/edit/delete and every
employee role/approval change, newest first. Transaction and role/status logging happens via
Postgres triggers (`log_transaction_change`, `log_profile_change` in
[schema.sql](supabase/schema.sql)) so it can't be skipped by going around the app. Account
create/remove/register events are logged by their respective edge functions instead, since
those run under the service role rather than a normal user session.

## Deploying to Cloudflare Pages

1. Push this repo to GitHub/GitLab.
2. In the Cloudflare dashboard: **Workers & Pages > Create > Pages > Connect to Git**.
3. Build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in
   **Settings > Environment variables** (both Production and Preview).
5. Deploy. The included `public/_redirects` file makes client-side routing (TanStack Router)
   work correctly on Cloudflare Pages.

Alternatively, from the CLI with [Wrangler](https://developers.cloudflare.com/pages/get-started/direct-upload/):

```bash
npm run build
npx wrangler pages deploy dist
```

## Notes

- `@supabase/supabase-js` was added to `package.json` (not in the original list you gave me) —
  it's required to talk to Supabase from the browser.
- Currency isn't hardcoded to a symbol; amounts render as plain numbers in
  [BalanceCard.tsx](src/components/BalanceCard.tsx) and [TransactionTable.tsx](src/components/TransactionTable.tsx) — add a prefix there if you want one.
- Usernames must be at least 3 characters, letters/numbers/underscore/period only (see
  [auth-schema.ts](src/schemas/auth-schema.ts)) — the synthetic email needs a clean local part.
