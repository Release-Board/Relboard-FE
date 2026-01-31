"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addBookmark, fetchMyBookmarksPage, removeBookmark } from "@/lib/api/relboard";
import type { BookmarkResult, Page, ReleaseResponse } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/authStore";

type BookmarkContext = {
  previous?: ReadonlyArray<readonly [readonly unknown[], Page<ReleaseResponse> | undefined]>;
};

type UseBookmarksOptions = {
  page?: number;
  size?: number;
};

export function useBookmarks(options: UseBookmarksOptions = {}) {
  const { user, accessToken } = useAuthStore();
  const enabled = Boolean(user && accessToken);
  const queryClient = useQueryClient();
  const page = options.page ?? 0;
  const size = options.size ?? 200;

  const bookmarksQuery = useQuery({
    queryKey: ["my-bookmarks", page, size],
    queryFn: () => fetchMyBookmarksPage({ page, size }),
    enabled,
  });

  const addMutation = useMutation<
    BookmarkResult,
    Error,
    ReleaseResponse,
    BookmarkContext
  >({
    mutationFn: (release) => addBookmark(release.id),
    onMutate: async (release) => {
      if (!enabled) return {};
      await queryClient.cancelQueries({ queryKey: ["my-bookmarks"] });
      const previous = queryClient.getQueriesData<Page<ReleaseResponse>>({
        queryKey: ["my-bookmarks"],
      });

      previous.forEach(([queryKey, data]) => {
        if (!data) return;
        const [_, keyPage] = queryKey as [string, number, number];
        if (keyPage !== 0) return;
        if (data.content.some((item) => item.id === release.id)) return;

        queryClient.setQueryData<Page<ReleaseResponse>>(queryKey, {
          ...data,
          content: [release, ...data.content],
          totalElements: data.totalElements + 1,
        });
      });

      return { previous };
    },
    onError: (_error, _release, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Keep optimistic cache; refresh only when explicitly requested.
    },
  });

  const removeMutation = useMutation<
    BookmarkResult,
    Error,
    ReleaseResponse,
    BookmarkContext
  >({
    mutationFn: (release) => removeBookmark(release.id),
    onMutate: async (release) => {
      if (!enabled) return {};
      await queryClient.cancelQueries({ queryKey: ["my-bookmarks"] });
      const previous = queryClient.getQueriesData<Page<ReleaseResponse>>({
        queryKey: ["my-bookmarks"],
      });

      previous.forEach(([queryKey, data]) => {
        if (!data) return;
        if (!data.content.some((item) => item.id === release.id)) return;

        queryClient.setQueryData<Page<ReleaseResponse>>(queryKey, {
          ...data,
          content: data.content.filter((item) => item.id !== release.id),
          totalElements: Math.max(0, data.totalElements - 1),
        });
      });

      return { previous };
    },
    onError: (_error, _release, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Keep optimistic cache; refresh only when explicitly requested.
    },
  });

  const bookmarksPage = bookmarksQuery.data as Page<ReleaseResponse> | undefined;
  const bookmarks = bookmarksPage?.content ?? [];
  const bookmarkIds = new Set(bookmarks.map((item) => item.id));

  return {
    enabled,
    page: bookmarksPage,
    bookmarks,
    isLoading: bookmarksQuery.isLoading,
    refetch: bookmarksQuery.refetch,
    isBookmarked: (id: number) => bookmarkIds.has(id),
    addBookmark: addMutation,
    removeBookmark: removeMutation,
  };
}
