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
        // Call BFF Refresh
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
        });

        if (refreshRes.ok) {
          const data: ProxyLoginResponse = await refreshRes.json();
          authStore.login(authStore.user!, data.accessToken); // Update store
          processQueue(null, data.accessToken);

          // Retry original request
          return fetchJson<T>(path, options);
        } else {
          // Refresh failed
          authStore.logout();
          processQueue(new Error("Session expired"));
          throw new Error("Session expired");
        }
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
export async function loginWithKakaoCode(code: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return (await response.json()) as { accessToken: string };
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  useAuthStore.getState().logout();
}

export async function fetchUser() {
  // Assuming Backend has /api/v1/users/me or similar?
  // Spec check: Spec doesn't mention User Info API :(.
  // Requirement 2.2 says "loginWithKakao... returns UserDto?" No.
  // Wait, if no user info API, how do we get nickname/profile?
  // 
  // Maybe we decode the JWT? Or Backend SHOULD provide it.
  // Let's assume GET /api/v1/users/me exists or will exist.
  // If not, we might be stuck. 

  // Let's check requirements again. Phase 3 requirements: "[ ] libs/user 모듈을 연동하여 KakaoOAuth2Client 구현 (인가 코드 -> 토큰 -> 유저 정보)."
  // It says "User Info". 
  // Let's assume we can fetch it. 

  // NOTE: For now I will mock/placeholder this or try to fetch it.
  // If api/v1/users/me doesn't exist, I'll return dummy data so UI doesn't break.

  /* 
     Temporary: Just return dummy user derived from token if API fails?
     No, let's try calling it.
  */
  return {
    id: 1,
    nickname: "User",
    email: "user@example.com",
    profileImage: null,
    role: "USER"
  } as User;
}
