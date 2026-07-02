// Supabase Auth's password flow is email-shaped, but this app logs in with
// a username. We map username -> a synthetic, non-deliverable email under
// the hood; email confirmation must stay OFF in the Supabase dashboard since
// nothing can ever receive mail at this address.
//
// This exact domain is duplicated in supabase/functions/create-employee —
// keep them in sync if you change it.
export const USERNAME_EMAIL_DOMAIN = "users.moneytracker.local";

export function usernameToEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${USERNAME_EMAIL_DOMAIN}`;
}
