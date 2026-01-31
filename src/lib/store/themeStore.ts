import { create } from "zustand";

export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "relboard-theme";

const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const readStoredTheme = (): ThemeMode | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") {
      return stored;
    }
  } catch {
    // Ignore storage access errors.
  }
  return null;
};

const persistTheme = (mode: ThemeMode) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore storage access errors.
  }
};

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  initialize: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "dark",
  setMode: (mode) => {
    persistTheme(mode);
    set({ mode });
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = mode;
    }
  },
  toggle: () => {
    const next = get().mode === "dark" ? "light" : "dark";
    get().setMode(next);
  },
  initialize: () => {
    const stored = readStoredTheme();
    const initial = stored ?? getSystemTheme();
    get().setMode(initial);
  },
}));
