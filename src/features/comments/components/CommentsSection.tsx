"use client";

import { useState } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import { useComments } from "@/features/comments/hooks/useComments";
import CommentItem from "@/features/comments/components/CommentItem";
import { handleAutoResize } from "@/features/comments/utils/textarea";

type Props = {
  releaseId: number;
};

const Section = styled.section`
  display: grid;
  gap: 16px;
  margin-top: 16px;
`;

const Heading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
`;

const Count = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const InputCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px;
  display: grid;
  gap: 10px;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Helper = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const Button = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentStrong};
  color: #ffffff;
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const List = styled.div`
  display: grid;
  gap: 14px;
`;

const EmptyState = styled.div`
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

export default function CommentsSection({ releaseId }: Props) {
  const {
    user,
    comments,
    page,
    isLoading,
    isError,
    createComment,
    updateComment,
    deleteComment,
  } = useComments({ releaseId });
  const [content, setContent] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const { t } = useStableTranslation();

  const totalElements = page?.totalElements ?? comments.length;

  const canSubmit = content.trim().length > 0 && content.trim().length <= 500;

  const handleSubmit = () => {
    if (!canSubmit) return;
    createComment.mutate(
      { content: content.trim() },
      {
        onSuccess: () => {
          setContent("");
        },
      }
    );
  };

  const handleReply = (parentId: string, replyContent: string) => {
    createComment.mutate({ content: replyContent, parentId });
  };

  const handleUpdate = (commentId: string, newContent: string) => {
    if (!newContent.trim()) return;
    updateComment.mutate({ commentId, content: newContent.trim() });
  };

  const handleDelete = (commentId: string) => {
    deleteComment.mutate(commentId);
  };

  const handleToggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Section>
      <Heading>
        <Title>{t("comments.title")}</Title>
        <Count>{t("comments.count", { count: totalElements })}</Count>
      </Heading>

      <InputCard>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onInput={handleAutoResize}
          placeholder={
            user ? t("comments.inputPlaceholderAuth") : t("comments.inputPlaceholderGuest")
          }
          disabled={!user}
          maxLength={500}
        />
        <InputRow>
          <Helper>{content.length}/500</Helper>
          <Button type="button" onClick={handleSubmit} disabled={!user || !canSubmit}>
            {t("common.register")}
          </Button>
        </InputRow>
      </InputCard>

      {isLoading && <EmptyState>{t("comments.loading")}</EmptyState>}
      {isError && <EmptyState>{t("comments.error")}</EmptyState>}
      {!isLoading && !isError && comments.length === 0 && (
        <EmptyState>{t("comments.empty")}</EmptyState>
      )}

      <List>
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            parentAuthor={null}
            currentUserId={user?.id ?? null}
            canInteract={Boolean(user)}
            onReply={handleReply}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            collapsedIds={collapsedIds}
            onToggleCollapse={handleToggleCollapse}
          />
        ))}
      </List>
    </Section>
  );
}
