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
  page?: number;
  hasNext?: boolean;
  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

export type TagType = "BREAKING" | "SECURITY" | "FEATURE" | "FIX" | "PERFORMANCE";
export type IssueTagType =
  | "BEGINNER_FRIENDLY"
  | "HELP_WANTED"
  | "BUG"
  | "FEATURE"
  | "DOCS"
  | "SECURITY"
  | "PERFORMANCE"
  | "BREAKING";

export type Category = string;

export type ReleaseResponse = {
  id: number;
  techStack: TechStackResponse;
  version: string;
  title: string;
  content: string;
  contentKo?: string | null;
  shortSummary?: string | null;
  insights?: Array<{
    title: string;
    reason: string;
    type?: TagType;
  }> | null;
  migrationGuide?: {
    description?: string;
    code?: {
      language?: string;
      snippet?: string;
      before?: string;
      after?: string;
    };
  } | null;
  technicalKeywords?: string[] | null;
  sourceUrl: string;
  publishedAt: string;
  tags: TagType[];
  viewCount?: number;
  bookmarkCount?: number;
  // Trending 전용 필드
  periodViewCount?: number;
  periodBookmarkCount?: number;
  score?: number;
};

export type CommentUser = {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
};

export type CommentResponse = {
  id: string;
  userId: string;
  releaseId: string;
  content: string;
  parentId: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
  children: CommentResponse[];
};

export type CommentCreateResult = {
  commentId: string;
};

export type CommentUpdateResult = {
  updated: boolean;
};

export type CommentDeleteResult = {
  deleted: boolean;
};

export type TechStackResponse = {
  id: number;
  name: string;
  latestVersion: string;
  latestReleaseAt?: string | null;
  description?: string | null;
  category: string;
  colorHex?: string | null;
};

export type User = {
  id: number;
  email: string | null;
  nickname: string;
  profileImageUrl: string | null;
  profileImageType?: "URL" | "DEFAULT" | "FILE" | null;
  bio?: string | null;
  githubUrl?: string | null;
  websiteUrl?: string | null;
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

export type IssueLabel = {
  name: string;
  color?: string | null;
  description?: string | null;
};

export type IssueResponse = {
  id: string;
  techStackId: string;
  sourceId: string;
  githubIssueId: string;
  issueNumber: number;
  title: string;
  body?: string | null;
  titleKo?: string | null;
  bodySummaryKo?: string | null;
  htmlUrl: string;
  state: string;
  commentCount: number;
  authorLogin?: string | null;
  githubCreatedAt: string;
  githubUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
  techStack: TechStackResponse;
  labels: IssueLabel[];
  tags: Array<{ tagType: IssueTagType }> | IssueTagType[];
  translation?: {
    titleKoReady?: boolean;
    summaryKoReady?: boolean;
  } | null;
};
