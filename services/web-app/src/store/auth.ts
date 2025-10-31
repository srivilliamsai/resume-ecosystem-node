import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ApiUser } from "@/api/types";

interface AuthState {
  token: string | null;
  user: ApiUser | null;
  setAuth: (payload: { token: string; user: ApiUser }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      clear: () => set({ token: null, user: null })
    }),
    {
      name: "resume-ecosystem-auth"
    }
  )
);
