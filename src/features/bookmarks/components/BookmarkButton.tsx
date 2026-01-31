"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import type { ReleaseResponse } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/authStore";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useToast } from "@/lib/hooks/useToast";

const Button = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accentStrong : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? "rgba(47, 107, 255, 0.12)" : theme.colors.surface};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Icon = styled.svg<{ $active: boolean }>`
  width: 18px;
  height: 18px;
  fill: ${({ $active, theme }) =>
    $active ? theme.colors.accentStrong : "transparent"};
  stroke: ${({ $active, theme }) =>
    $active ? theme.colors.accentStrong : theme.colors.muted};
  stroke-width: 1.6;
`;

type Props = {
  release: ReleaseResponse;
};

export default function BookmarkButton({ release }: Props) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { t } = useStableTranslation();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks({
    page: 0,
    size: 200,
  });
  const toast = useToast();
  const bookmarked = isBookmarked(release.id);
  const isPending = addBookmark.isPending || removeBookmark.isPending;

  const handleClick = () => {
    if (!user || !accessToken) {
      router.push("/login");
      return;
    }

    if (bookmarked) {
      removeBookmark.mutate(release, {
        onSuccess: () => toast(t("toast.bookmarkRemoved"), { tone: "info" }),
        onError: () => toast(t("toast.bookmarkRemoveFail"), { tone: "error" }),
      });
    } else {
      addBookmark.mutate(release, {
        onSuccess: () => toast(t("toast.bookmarkAdded"), { tone: "success" }),
        onError: () => toast(t("toast.bookmarkAddFail"), { tone: "error" }),
      });
    }
  };

  return (
    <Button
      type="button"
      $active={bookmarked}
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={bookmarked}
      aria-label={bookmarked ? t("bookmark.remove") : t("bookmark.label")}
      title={bookmarked ? t("bookmark.active") : t("bookmark.label")}
    >
      <Icon $active={bookmarked} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.5h12a1.5 1.5 0 0 1 1.5 1.5v15.2a.3.3 0 0 1-.47.25L12 16.2l-7.03 4.25a.3.3 0 0 1-.47-.25V5A1.5 1.5 0 0 1 6 3.5z" />
      </Icon>
    </Button>
  );
}
