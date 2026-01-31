"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import type { CommentResponse } from "@/lib/api/types";
import {
  ActionButton,
  Actions,
  Author,
  AuthorRow,
  Avatar,
  AvatarFallback,
  ChildList,
  CollapseButton,
  CommentBody,
  CommentItemWrap,
  CommentRow,
  CommentWrapper,
  Content,
  Editor,
  InlineActions,
  InlineButton,
  InlineToggle,
  Prefix,
  Timestamp,
} from "@/features/comments/components/commentStyles";
import { formatRelativeTime } from "@/features/comments/utils/commentTime";
import { handleAutoResize } from "@/features/comments/utils/textarea";

export type CommentItemProps = {
  comment: CommentResponse;
  depth: number;
  parentAuthor?: string | null;
  currentUserId: number | null;
  canInteract: boolean;
  onReply: (parentId: string, content: string) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  collapsedIds: Set<string>;
  onToggleCollapse: (id: string) => void;
};

export default function CommentItem({
  comment,
  depth,
  parentAuthor = null,
  currentUserId,
  canInteract,
  onReply,
  onUpdate,
  onDelete,
  collapsedIds,
  onToggleCollapse,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editingContent, setEditingContent] = useState(comment.content);
  const [isEditing, setIsEditing] = useState(false);
  const { t } = useStableTranslation();

  const hasChildren = comment.children?.length > 0;
  const isCollapsed = collapsedIds.has(comment.id);
  const isMine = currentUserId !== null && currentUserId === Number(comment.userId);

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.id, replyContent.trim());
    setReplyContent("");
    setIsReplying(false);
  };

  const prefix = parentAuthor ? `@${parentAuthor} ` : "";

  return (
    <CommentWrapper>
      <CommentItemWrap>
        <CommentRow>
          {comment.user.profileImageUrl ? (
            <Avatar
              src={comment.user.profileImageUrl}
              alt={`${comment.user.nickname} 프로필 이미지`}
            />
          ) : (
            <AvatarFallback aria-hidden="true">
              {comment.user.nickname?.trim().slice(0, 1) || "U"}
            </AvatarFallback>
          )}
          <CommentBody>
            <AuthorRow>
              <Author>{comment.user.nickname}</Author>
              <Timestamp>{formatRelativeTime(comment.createdAt)}</Timestamp>
              {hasChildren && (
                <InlineToggle type="button" onClick={() => onToggleCollapse(comment.id)}>
                  {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                </InlineToggle>
              )}
            </AuthorRow>

            {isEditing ? (
              <>
                <Editor
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  onInput={handleAutoResize}
                  maxLength={500}
                />
                <InlineActions>
                  <InlineButton
                    type="button"
                    onClick={() => {
                      onUpdate(comment.id, editingContent.trim());
                      setIsEditing(false);
                    }}
                    disabled={!editingContent.trim()}
                  >
                    {t("common.save")}
                  </InlineButton>
                  <InlineButton type="button" onClick={() => setIsEditing(false)}>
                    {t("common.cancel")}
                  </InlineButton>
                </InlineActions>
              </>
            ) : (
              <>
                <Content $muted={comment.isDeleted}>
                  {comment.isDeleted ? (
                    comment.content
                  ) : (
                    <>
                      {prefix && <Prefix>{prefix}</Prefix>}
                      {comment.content}
                    </>
                  )}
                </Content>
                <Actions>
                  {canInteract && !comment.isDeleted && (
                    <ActionButton type="button" onClick={() => setIsReplying(!isReplying)}>
                      {t("comments.reply")}
                    </ActionButton>
                  )}
                  {isMine && !comment.isDeleted && (
                    <>
                      <ActionButton
                        type="button"
                        onClick={() => {
                          setIsEditing(true);
                          setEditingContent(comment.content);
                        }}
                      >
                        {t("comments.edit")}
                      </ActionButton>
                      <ActionButton type="button" onClick={() => onDelete(comment.id)}>
                        {t("comments.delete")}
                      </ActionButton>
                    </>
                  )}
                </Actions>
              </>
            )}

            {isReplying && (
              <>
                <Editor
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                  onInput={handleAutoResize}
                  placeholder={t("comments.replyPlaceholder")}
                  maxLength={500}
                />
                <InlineActions>
                  <InlineButton type="button" onClick={handleSubmitReply} disabled={!replyContent.trim()}>
                    {t("common.register")}
                  </InlineButton>
                  <InlineButton
                    type="button"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent("");
                    }}
                  >
                    {t("common.cancel")}
                  </InlineButton>
                </InlineActions>
              </>
            )}

            {isCollapsed && hasChildren && (
              <CollapseButton type="button" onClick={() => onToggleCollapse(comment.id)}>
                {t("comments.moreReplies", { count: comment.children.length })}
              </CollapseButton>
            )}
          </CommentBody>
        </CommentRow>

        {!isCollapsed && hasChildren && (
          <ChildList>
            {comment.children.map((child) => (
              <CommentItem
                key={child.id}
                comment={child}
                depth={depth + 1}
                parentAuthor={comment.user.nickname}
                currentUserId={currentUserId}
                canInteract={canInteract}
                onReply={onReply}
                onUpdate={onUpdate}
                onDelete={onDelete}
                collapsedIds={collapsedIds}
                onToggleCollapse={onToggleCollapse}
              />
            ))}
          </ChildList>
        )}
      </CommentItemWrap>
    </CommentWrapper>
  );
}
