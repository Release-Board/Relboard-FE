import { API_BASE_URL, fetchJson } from "./client";
import { useAuthStore } from "@/lib/store/authStore";
import type {
  CommonApiResponse,
  BookmarkResult,
  CommentCreateResult,
  CommentDeleteResult,
  CommentResponse,
  CommentUpdateResult,
  Page,
  ReleaseResponse,
  SubscriptionResult,
  TagType,
  TechStackResponse,
  User,
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

export async function fetchTrendingReleases(params: {
  period?: "WEEKLY" | "DAILY";
  limit?: number;
}) {
  const query = buildQuery({
    period: params.period,
    limit: params.limit,
  });
  const response = await fetchJson<
    CommonApiResponse<ReleaseResponse[]> | ReleaseResponse[]
  >(`/api/v1/releases/trending${query}`);

  return unwrapResponse<ReleaseResponse[]>(
    response,
    "Failed to fetch trending releases"
  );
}

export function trackReleaseView(releaseId: number) {
  fetch(`${API_BASE_URL}/api/v1/releases/${releaseId}/view`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {
    // Fire-and-forget
  });
}

export async function fetchComments(
  releaseId: number,
  params: { page?: number; size?: number } = {}
) {
  const query = buildQuery({
    page: params.page,
    size: params.size,
  });
  const response = await fetchJson<CommonApiResponse<Page<CommentResponse>>>(
    `/api/v1/releases/${releaseId}/comments${query}`
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to fetch comments");
  }

  return response.data;
}

export async function createComment(releaseId: number, payload: {
  content: string;
  parentId?: string;
}) {
  const response = await fetchJson<CommonApiResponse<CommentCreateResult>>(
    `/api/v1/releases/${releaseId}/comments`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to create comment");
  }

  return response.data;
}

export async function updateComment(commentId: string, payload: { content: string }) {
  const response = await fetchJson<CommonApiResponse<CommentUpdateResult>>(
    `/api/v1/comments/${commentId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to update comment");
  }

  return response.data;
}

export async function deleteComment(commentId: string) {
  const response = await fetchJson<CommonApiResponse<CommentDeleteResult>>(
    `/api/v1/comments/${commentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to delete comment");
  }

  return response.data;
}

export type ProfileUpdatePayload = {
  nickname?: string;
  bio?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
  email?: string | null;
  profileImageType?: "URL" | "DEFAULT";
  profileImageUrl?: string | null;
};

export async function fetchMyProfile() {
  const response = await fetchJson<CommonApiResponse<User>>("/api/v1/users/me");
  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to fetch profile");
  }
  return response.data;
}

export async function updateMyProfile(payload: ProfileUpdatePayload) {
  const response = await fetchJson<CommonApiResponse<{ updated: boolean }>>(
    "/api/v1/users/me/profile",
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to update profile");
  }

  return response.data;
}

export async function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/profile-image`, {
    method: "POST",
    credentials: "include",
    body: formData,
    headers: (() => {
      const headers = new Headers();
      const authStore = useAuthStore.getState();
      if (authStore.accessToken) {
        headers.set("Authorization", `Bearer ${authStore.accessToken}`);
      }
      return headers;
    })(),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const body = (await response.json()) as CommonApiResponse<{ profileImageUrl: string }>;
  if (!body.success) {
    throw new Error(body.error?.message ?? "Failed to upload profile image");
  }

  return body.data;
}

export async function deleteProfileImage() {
  const response = await fetchJson<CommonApiResponse<{ updated: boolean }>>(
    "/api/v1/users/me/profile-image",
    {
      method: "DELETE",
    }
  );

  if (!response.success) {
    throw new Error(response.error?.message ?? "Failed to delete profile image");
  }

  return response.data;
}
