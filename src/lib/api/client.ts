import { useAuthStore } from "@/lib/store/authStore";
import type { CommonApiResponse, User } from "./types";

const DEFAULT_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

type FetchOptions = RequestInit & {
  baseUrl?: string;
  skipAuth?: boolean;
};

// Queue for holding requests while refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function refreshAccessToken() {
  const refreshRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!refreshRes.ok) {
    return null;
  }

  const body: CommonApiResponse<{ accessToken: string }> =
    await refreshRes.json();
  if (!body.success || !body.data?.accessToken) {
    return null;
  }

  return body.data.accessToken;
}

export async function fetchJson<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { baseUrl = API_BASE_URL, skipAuth = false, ...init } = options;
  const authStore = useAuthStore.getState();

  const headers = new Headers(init.headers);

  // 1. Inject Token
  if (!skipAuth && authStore.accessToken) {
    headers.set("Authorization", `Bearer ${authStore.accessToken}`);
  }

  headers.set("Content-Type", "application/json");

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include", // Important for Cookies (RefreshToken)
    });

    // 2. Handle 401 (Refresh Logic)
    if (response.status === 401 && !skipAuth) {
      if (isRefreshing) {
        // Wait for refresh to finish
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => fetchJson<T>(path, options))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Direct Backend Refresh (Cookies sent automatically)
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          authStore.setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);
          return fetchJson<T>(path, options);
        }

        // Refresh failed
        authStore.logout();
        processQueue(new Error("Session expired"));
        throw new Error("Session expired");
      } catch (err) {
        processQueue(err as Error);
        authStore.logout();
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    throw error;
  }
}

// Auth APIs

export async function logout() {
  await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include"
  });
  useAuthStore.getState().logout();
}

export async function fetchUser() {
  const response = await fetchJson<CommonApiResponse<User>>("/api/v1/users/me");
  return response.data;
}
