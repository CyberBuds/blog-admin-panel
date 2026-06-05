import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) =>
        set({
          token,
          user: {
            ...user,
            initials: user.name || ""
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
          },
          isAuthenticated: true,
        }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "auth-store" }
  )
);