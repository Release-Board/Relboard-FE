"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addIssueBookmark,
  fetchMyIssueBookmarksPage,
  removeIssueBookmark,
} from "@/lib/api/relboard";
import type { BookmarkResult, IssueResponse, Page } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/authStore";

type UseIssueBookmarksOptions = {
  page?: number;
  size?: number;
};

export function useIssueBookmarks(options: UseIssueBookmarksOptions = {}) {
  const { user, accessToken } = useAuthStore();
  const enabled = Boolean(user && accessToken);
  const queryClient = useQueryClient();
  const page = options.page ?? 0;
  const size = options.size ?? 200;

  const bookmarksQuery = useQuery({
    queryKey: ["my-issue-bookmarks", page, size],
    queryFn: () => fetchMyIssueBookmarksPage({ page, size }),
    enabled,
  });

  const addMutation = useMutation<BookmarkResult, Error, string>({
    mutationFn: (issueId) => addIssueBookmark(issueId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-issue-bookmarks"] });
    },
  });

  const removeMutation = useMutation<BookmarkResult, Error, string>({
    mutationFn: (issueId) => removeIssueBookmark(issueId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["my-issue-bookmarks"] });
    },
  });

  const bookmarksPage = bookmarksQuery.data as Page<IssueResponse> | undefined;
  const bookmarks = bookmarksPage?.content ?? [];
  const bookmarkIds = new Set(bookmarks.map((item) => String(item.id)));

  return {
    enabled,
    page: bookmarksPage,
    bookmarks,
    isLoading: bookmarksQuery.isLoading,
    refetch: bookmarksQuery.refetch,
    isBookmarked: (id: string | number) => bookmarkIds.has(String(id)),
    addBookmark: addMutation,
    removeBookmark: removeMutation,
  };
}
