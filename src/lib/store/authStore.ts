import { create } from "zustand";
import type { User } from "../api/types";

type AuthState = {
    user: User | null;
    accessToken: string | null;
    isInitialized: boolean;
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    setAccessToken: (accessToken: string | null) => void;
    setUser: (user: User | null) => void;
    setInitialized: (initialized: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isInitialized: false,
    login: (user, accessToken) => set({ user, accessToken }),
    logout: () => set({ user: null, accessToken: null }),
    setAccessToken: (accessToken) => set({ accessToken }),
    setUser: (user) => set({ user }),
    setInitialized: (initialized) => set({ isInitialized: initialized }),
}));
