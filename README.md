# Money Tracker

Internal admin/employee tool for tracking cash in and out. Employees record "Money In" /
"Money Out" entries; admins see the full ledger, current balance, can edit or delete any
entry, and manage employee roles.

## Stack

- React 19 + TypeScript + Vite
- Ant Design 6 (UI), vanilla-extract (layout/theme tokens)
- TanStack Router (code-based routes, role-guarded)
- react-hook-form + zod for form validation
- zustand for auth/session state
- Supabase (Postgres + Auth) as the backend
- vite-plugin-pwa for installability

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Open **SQL Editor** and run the entire contents of [supabase/schema.sql](supabase/schema.sql).
   This creates the `profiles` and `transactions` tables, row-level security policies, and a
   trigger that auto-provisions a `profiles` row whenever someone signs up.
   - **The very first account to register becomes admin automatically.** Everyone who signs
     up after that defaults to `employee`. You (the business owner) should register first.
   - Admins can promote/demote other accounts from the in-app **Employees** page later.
3. In **Project Settings > API**, copy the **Project URL** and **anon public** key.
4. If you don't want email confirmation on signup (recommended for a small closed team),
   turn it off under **Authentication > Providers > Email > Confirm email**.

## 2. Configure the app

```bash
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from step 1.

## 3. Install and run

```bash
npm install
npm run dev
```

Register your own account first (it becomes admin), then have employees register their own
accounts — they'll default to the `employee` role.

## Roles

| Action                         | Employee | Admin |
| ------------------------------- | :------: | :---: |
| Add a "Money In" / "Money Out" entry | ✅ | ✅ |
| View own entries               | ✅       | ✅ (all) |
| View overall balance           | ❌       | ✅ |
| Edit / delete any entry        | ❌       | ✅ |
| Promote/demote employee roles  | ❌       | ✅ |

All of this is enforced both in the UI and via Postgres row-level security (see
[supabase/schema.sql](supabase/schema.sql)), so the rules hold even if someone calls the
Supabase API directly.

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
