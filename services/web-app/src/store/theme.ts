import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggle: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        set({ theme: next });
      },
      setTheme: (theme) => set({ theme })
    }),
    {
      name: "resume-ecosystem-theme"
    }
  )
);
