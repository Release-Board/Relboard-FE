import { fetchJson } from "./client";
import type {
  CommonApiResponse,
  Page,
  ReleaseResponse,
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
