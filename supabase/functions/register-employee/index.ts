// Public self-registration endpoint. Anyone can call this (that's the
// point — it's what the /register page uses), but it creates the account
// through the Admin API rather than the public sign-up flow, so Supabase
// never tries to send a confirmation email and there's nothing to rate
// limit. New accounts land as role=employee, status=pending (handled by
// the handle_new_user trigger) unless they're the very first account ever,
// which becomes an approved admin automatically.
//
// Deploy with: supabase functions deploy register-employee

import { createClient } from "npm:@supabase/supabase-js@2";

// Must match USERNAME_EMAIL_DOMAIN in src/lib/auth-helpers.ts.
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

  let body: { fullName?: string; username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const { fullName, username, password } = body;
  if (!fullName || !username || !password) {
    return json({ error: "Name, username, and password are required" }, 400);
  }
  if (username.length < 3 || !/^[a-zA-Z0-9_.]+$/.test(username)) {
    return json({ error: "Username must be at least 3 characters: letters, numbers, underscore, or period only" }, 400);
  }
  if (password.length < 6) {
    return json({ error: "Password must be at least 6 characters" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: usernameToEmail(username),
    password,
    email_confirm: true,
    user_metadata: { username, full_name: fullName },
  });

  if (createError) {
    const message = createError.message.includes("already been registered")
      ? "That username is already taken"
      : createError.message;
    return json({ error: message }, 400);
  }
  if (!created.user) {
    return json({ error: "Registration failed" }, 500);
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("status")
    .eq("id", created.user.id)
    .single();

  await adminClient.from("activity_logs").insert({
    actor_id: created.user.id,
    action: "employee.register",
    details: { username, full_name: fullName },
  });

  return json({ id: created.user.id, username, status: profile?.status ?? "pending" }, 200);
});
