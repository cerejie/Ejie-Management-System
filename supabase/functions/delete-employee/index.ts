// Lets an admin permanently remove another account (their Supabase Auth user
// and, via cascade, their profile and any transactions they recorded).
//
// Runs server-side because deleting another user requires the Supabase
// service-role key, which must never be shipped to the browser.
// Deploy with: supabase functions deploy delete-employee

import { createClient } from "npm:@supabase/supabase-js@2";

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
    return json({ error: "Only admins can remove accounts" }, 403);
  }

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }

  const { userId } = body;
  if (!userId) {
    return json({ error: "userId is required" }, 400);
  }
  if (userId === user.id) {
    return json({ error: "You can't remove your own account" }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: target } = await adminClient.from("profiles").select("username").eq("id", userId).single();

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    return json({ error: deleteError.message }, 400);
  }

  await adminClient.from("activity_logs").insert({
    actor_id: user.id,
    action: "employee.remove",
    details: { target_id: userId, username: target?.username ?? null },
  });

  return json({ id: userId }, 200);
});
