import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  status: "loading" | "signed-in" | "signed-out";
  initialize: () => () => void;
  hydrate: (session: Session) => Promise<void>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to load profile", error);
    return null;
  }

  return data;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  status: "loading",

  initialize: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const profile = session ? await fetchProfile(session.user.id) : null;
      set({ session, profile, status: session ? "signed-in" : "signed-out" });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const profile = session ? await fetchProfile(session.user.id) : null;
      set({ session, profile, status: session ? "signed-in" : "signed-out" });
    });

    return () => subscription.unsubscribe();
  },

  hydrate: async (session: Session) => {
    const profile = await fetchProfile(session.user.id);
    set({ session, profile, status: "signed-in" });
  },

  refreshProfile: async () => {
    const { session } = get();
    if (!session) return;
    const profile = await fetchProfile(session.user.id);
    set({ profile });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, status: "signed-out" });
  },
}));
