import { create } from "zustand";
import i18n from "@/lib/i18n";

export type Language = "ko" | "en";

const STORAGE_KEY = "relboard-language";

const getSystemLanguage = (): Language => {
  if (typeof window === "undefined") return "en";
  const lang = window.navigator.language.toLowerCase();
  return lang.startsWith("ko") ? "ko" : "en";
};

const readStoredLanguage = (): Language | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "ko" || stored === "en") {
      return stored;
    }
  } catch {
    // Ignore storage access errors.
  }
  return null;
};

const persistLanguage = (lang: Language) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Ignore storage access errors.
  }
};

type LanguageState = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggle: () => void;
  initialize: () => void;
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: "en",
  setLanguage: (language) => {
    persistLanguage(language);
    i18n.changeLanguage(language);
    set({ language });
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  },
  toggle: () => {
    const next = get().language === "ko" ? "en" : "ko";
    get().setLanguage(next);
  },
  initialize: () => {
    const stored = readStoredLanguage();
    const initial = stored ?? getSystemLanguage();
    get().setLanguage(initial);
  },
}));
