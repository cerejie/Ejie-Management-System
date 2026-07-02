// Lets an admin create an employee's login (username + password) directly,
// without the employee having to self-register or wait for approval.
//
// Runs server-side because creating another user's account requires the
// Supabase service-role key, which must never be shipped to the browser.
// Deploy with: supabase functions deploy create-employee

import { createClient } from "npm:@supabase/supabase-js@2";

// Must match USERNAME_EMAIL_DOMAIN in src/lib/auth-helpers.ts — this is how
// a username becomes the synthetic, non-deliverable email Supabase Auth
// needs under the hood.
const USERNAME_EMAIL_DOMAIN = "users.moneytracker.local";

function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${USERNAME_EMAIL_DOMAIN}`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing authorization header" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Scoped to the caller's own session so RLS tells us their real role —
  // never trust a role claim sent in the request body.
  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();

  if (userError || !user) {
    return json({ error: "Invalid session" }, 401);
  }

  const { data: callerProfile, error: profileError } = await callerClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || callerProfile?.role !== "admin") {
    return json({ error: "Only admins can create employee accounts" }, 403);
  }

  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const { username, password } = body;
  if (!username || !password) {
    return json({ error: "Username and password are required" }, 400);
  }
  if (password.length < 6) {
    return json({ error: "Password must be at least 6 characters" }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createError) {
    return json({ error: createError.message }, 400);
  }
  if (!created.user) {
    return json({ error: "User creation failed" }, 500);
  }

  // Admin-created accounts skip the pending-approval queue.
  const { error: approveError } = await adminClient
    .from("profiles")
    .update({ status: "approved" })
    .eq("id", created.user.id);

  if (approveError) {
    return json({ error: approveError.message }, 500);
  }

  await adminClient.from("activity_logs").insert({
    actor_id: user.id,
    action: "employee.create",
    details: { target_id: created.user.id, username },
  });

  return json({ id: created.user.id, username }, 200);
});
