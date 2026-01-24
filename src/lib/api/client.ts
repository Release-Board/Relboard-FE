const DEFAULT_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

type FetchOptions = RequestInit & {
  baseUrl?: string;
};

export async function fetchJson<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { baseUrl = API_BASE_URL, ...init } = options;
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
