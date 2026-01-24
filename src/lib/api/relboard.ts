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
  tagType?: TagType;
};

function buildQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function fetchReleases(params: ReleaseListParams) {
  const query = buildQuery(params);
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
  const query = buildQuery(params);
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
