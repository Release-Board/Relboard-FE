import { fetchJson } from "./client";
import type {
  CommonApiResponse,
  BookmarkResult,
  Page,
  ReleaseResponse,
  SubscriptionResult,
  TagType,
  TechStackResponse,
} from "./types";

export type ReleaseListParams = {
  page?: number;
  size?: number;
  tags?: TagType[];
  categories?: string[];
  keyword?: string;
};

export type BookmarkListParams = {
  page?: number;
  size?: number;
};

function buildQuery(params: Record<string, string | number | undefined | Array<string>>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function unwrapResponse<T>(response: unknown, fallbackMessage: string): T {
  if (response && typeof response === "object" && "success" in response) {
    const typed = response as CommonApiResponse<T>;
    if (!typed.success) {
      throw new Error(typed.error?.message ?? fallbackMessage);
    }
    return typed.data;
  }
  return response as T;
}

export async function fetchReleases(params: ReleaseListParams) {
  const query = buildQuery(params as unknown as Record<string, string | number | undefined | Array<string>>);
  const response = await fetchJson<CommonApiResponse<Page<ReleaseResponse>>>(
    `/api/v1/releases${query}`
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to fetch releases");
  }

  return response.data;
}

export async function fetchTechStackReleases(
  techStackName: string,
  params: ReleaseListParams
) {
  const query = buildQuery(params as unknown as Record<string, string | number | undefined | Array<string>>);
  const response = await fetchJson<CommonApiResponse<Page<ReleaseResponse>>>(
    `/api/v1/tech-stacks/${techStackName}/releases${query}`
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to fetch releases");
  }

  return response.data;
}

export async function fetchTechStacks() {
  const response = await fetchJson<CommonApiResponse<TechStackResponse[]>>(
    "/api/v1/tech-stacks"
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to fetch tech stacks");
  }

  return response.data;
}

export async function fetchCategories() {
  const response = await fetchJson<CommonApiResponse<string[]>>(
    "/api/v1/tech-stacks/categories"
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to fetch categories");
  }

  return response.data;
}

export async function fetchMySubscriptions() {
  const response = await fetchJson<CommonApiResponse<TechStackResponse[]>>(
    "/api/v1/users/me/subscriptions"
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to fetch subscriptions");
  }

  return response.data;
}

export async function subscribeTechStack(techStackId: number) {
  const response = await fetchJson<CommonApiResponse<SubscriptionResult>>(
    `/api/v1/tech-stacks/${techStackId}/subscribe`,
    {
      method: "POST",
    }
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to subscribe");
  }

  return response.data;
}

export async function unsubscribeTechStack(techStackId: number) {
  const response = await fetchJson<CommonApiResponse<SubscriptionResult>>(
    `/api/v1/tech-stacks/${techStackId}/subscribe`,
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to unsubscribe");
  }

  return response.data;
}

export async function addBookmark(releaseId: number) {
  const response = await fetchJson<CommonApiResponse<BookmarkResult> | BookmarkResult>(
    `/api/v1/releases/${releaseId}/bookmark`,
    {
      method: "POST",
    }
  );
  return unwrapResponse<BookmarkResult>(response, "Failed to add bookmark");
}

export async function removeBookmark(releaseId: number) {
  const response = await fetchJson<CommonApiResponse<BookmarkResult> | BookmarkResult>(
    `/api/v1/releases/${releaseId}/bookmark`,
    {
      method: "DELETE",
    }
  );
  return unwrapResponse<BookmarkResult>(response, "Failed to remove bookmark");
}

export async function fetchMyBookmarks() {
  const response = await fetchJson<CommonApiResponse<Page<ReleaseResponse>> | Page<ReleaseResponse>>(
    "/api/v1/users/me/bookmarks"
  );
  return unwrapResponse<Page<ReleaseResponse>>(response, "Failed to fetch bookmarks");
}

export async function fetchMyBookmarksPage(params: BookmarkListParams) {
  const query = buildQuery(
    params as unknown as Record<string, string | number | undefined | Array<string>>
  );
  const response = await fetchJson<
    CommonApiResponse<Page<ReleaseResponse>> | Page<ReleaseResponse> | ReleaseResponse[]
  >(
    `/api/v1/users/me/bookmarks${query}`
  );
  const data = unwrapResponse<Page<ReleaseResponse> | ReleaseResponse[]>(
    response,
    "Failed to fetch bookmarks"
  );

  if (Array.isArray(data)) {
    return {
      content: data,
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length,
    };
  }

  return data;
}
