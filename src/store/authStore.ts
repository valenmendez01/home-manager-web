import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { AuthState } from "@/types/auth";

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  setSession: (session) => set({ session, user: session?.user ?? null }),

  setInitialized: (value) => set({ isInitialized: value }),

  signIn: async (email, password) => {
    set({ isLoading: true });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    set({ isLoading: false });

    if (error) {
      return { error: error.message };
    }

    set({ session: data.session, user: data.user });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
