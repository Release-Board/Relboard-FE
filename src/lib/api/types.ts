export type CommonApiResponse<T> = {
  success: boolean;
  data: T;
  error: ApiError | null;
};

export type ApiError = {
  code: string;
  message: string;
  errors?: Record<string, string> | null;
};

export type Page<T> = {
  content: T[];
  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type TagType = "BREAKING" | "SECURITY" | "FEATURE" | "FIX";

export type Category = string;

export type ReleaseResponse = {
  id: number;
  techStack: TechStackResponse;
  version: string;
  title: string;
  content: string;
  contentKo?: string | null;
  sourceUrl: string;
  publishedAt: string;
  tags: TagType[];
};

export type TechStackResponse = {
  id: number;
  name: string;
  latestVersion: string;
  category: string;
  colorHex?: string | null;
};

export type User = {
  id: number;
  email: string | null;
  nickname: string;
  profileImageUrl: string | null;
  role: "USER" | "ADMIN";
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  grantType: string;
  expiresIn: number;
};



export type AuthTokenResponse = {
  accessToken: string;
  refreshToken: string;
  grantType: string;
  expiresIn: number;
};

export type SubscriptionResult = {
  subscribed: boolean;
  created?: boolean;
  deleted?: boolean;
};

export type BookmarkResult = {
  bookmarked: boolean;
  created?: boolean;
  deleted?: boolean;
};
