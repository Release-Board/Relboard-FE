"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createComment,
  deleteComment,
  fetchComments,
  updateComment,
} from "@/lib/api/relboard";
import type { CommentResponse, Page } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/authStore";

type UseCommentsOptions = {
  releaseId: number;
  page?: number;
  size?: number;
};

export function useComments({ releaseId, page = 0, size = 20 }: UseCommentsOptions) {
  const { user, accessToken } = useAuthStore();
  const enabled = Boolean(releaseId);
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ["release-comments", releaseId, page, size],
    queryFn: () => fetchComments(releaseId, { page, size }),
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { content: string; parentId?: string }) =>
      createComment(releaseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-comments", releaseId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { commentId: string; content: string }) =>
      updateComment(payload.commentId, { content: payload.content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-comments", releaseId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["release-comments", releaseId] });
    },
  });

  const pageData = commentsQuery.data as Page<CommentResponse> | undefined;

  return {
    user,
    accessToken,
    comments: pageData?.content ?? [],
    page: pageData,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    createComment: createMutation,
    updateComment: updateMutation,
    deleteComment: deleteMutation,
    refetch: commentsQuery.refetch,
  };
}
