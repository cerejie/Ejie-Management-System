// One-time script to create the very first admin account, using the Admin
// API directly (never through the public sign-up flow, so Supabase never
// tries to send a confirmation email). Run once, then use the in-app
// Employees page for every account after that.
//
// Usage:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
//   node scripts/bootstrap-admin.mjs <username> <password>

import { createClient } from "@supabase/supabase-js";

const USERNAME_EMAIL_DOMAIN = "users.moneytracker.local";

const [, , username, password] = process.argv;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!username || !password) {
  console.error("Usage: node scripts/bootstrap-admin.mjs <username> <password>");
  process.exit(1);
}
if (!supabaseUrl || !serviceRoleKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars first.");
  process.exit(1);
}
if (username.length < 3 || !/^[a-zA-Z0-9_.]+$/.test(username)) {
  console.error("Username must be at least 3 characters: letters, numbers, underscore, or period only.");
  process.exit(1);
}
if (password.length < 6) {
  console.error("Password must be at least 6 characters.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const email = `${username.trim().toLowerCase()}@${USERNAME_EMAIL_DOMAIN}`;

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { username },
});

if (createError) {
  console.error("Failed to create user:", createError.message);
  process.exit(1);
}

const { error: profileError } = await supabase
  .from("profiles")
  .update({ role: "admin", status: "approved" })
  .eq("id", created.user.id);

if (profileError) {
  console.error("User was created but promoting to admin failed:", profileError.message);
  console.error(`You can fix this manually in the Table Editor: set role='admin', status='approved' for id=${created.user.id}`);
  process.exit(1);
}

console.log(`Admin account created. Log in at /login with username "${username}".`);
