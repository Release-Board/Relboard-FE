"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

import Markdown from "@/components/Markdown";
import type { ReleaseResponse, TagType } from "@/lib/api/types";
import { getTagStyleByTagType } from "@/styles/semantic-tags";
import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import BookmarkButton from "@/features/bookmarks/components/BookmarkButton";
import { trackReleaseView } from "@/lib/api/relboard";
import CommentsSection from "@/features/comments/components/CommentsSection";

const Card = styled.article`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
  display: grid;
  gap: 14px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
`;

const StackBadge = styled.span<{ $color?: string }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ $color, theme }) =>
    $color
      ? `color-mix(in srgb, ${$color} 15%, ${theme.colors.surface})`
      : "rgba(47, 107, 255, 0.12)"};
  color: ${({ $color, theme }) => $color ?? theme.colors.accentStrong};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid
    ${({ $color, theme }) =>
    $color
      ? `color-mix(in srgb, ${$color} 45%, ${theme.colors.surface})`
      : theme.colors.border};
`;

const VersionTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.muted};
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const ReleaseTitle = styled.button`
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const HeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const ExpandButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.accentStrong};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const MarkdownPanel = styled.div`
  position: relative;
  margin-top: 6px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-top: 2px solid ${({ theme }) => theme.colors.accentStrong};
  border-radius: ${({ theme }) => theme.radii.md};
`;

const FileTabs = styled.div`
  position: absolute;
  top: -24px;
  left: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const FileTabButton = styled.button<{ $active: boolean }>`
  padding: 4px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accentStrong};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const TranslationNotice = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(47, 107, 255, 0.12);
  color: ${({ theme }) => theme.colors.accentStrong};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
`;

const Tag = styled.span<{ $variant: TagType }>`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ $variant }) => getTagStyleByTagType($variant).background};
  color: ${({ $variant }) => getTagStyleByTagType($variant).color};
  box-shadow: ${({ $variant }) => getTagStyleByTagType($variant).boxShadow};
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

type Props = {
  release: ReleaseResponse;
};

export default function ReleaseCard({ release }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showKorean, setShowKorean] = useState(Boolean(release.contentKo));
  const hasContent = Boolean(release.content || release.contentKo);
  const canTranslate = Boolean(release.contentKo);
  const viewTrackedRef = useRef(false);

  const trackViewOnce = () => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    trackReleaseView(release.id);
  };

  useEffect(() => {
    if (expanded) {
      trackViewOnce();
    }
  }, [expanded]);

  return (
    <Card>
      <Header>
        <StackBadge $color={release.techStack.colorHex ?? undefined}>
          {release.techStack.name}
        </StackBadge>
        <HeaderActions>
          <SubscribeButton techStack={release.techStack} />
          <BookmarkButton release={release} />
        </HeaderActions>
      </Header>
      <ReleaseTitle
        type="button"
        onClick={() => {
          trackViewOnce();
          if (hasContent) {
            setExpanded(true);
          }
        }}
      >
        {release.title || `v${release.version}`}
      </ReleaseTitle>
      <VersionTitle>v{release.version}</VersionTitle>
      <Meta>
        <span>{formatDate(release.publishedAt)}</span>
        <Link href={release.sourceUrl} target="_blank" rel="noreferrer">
          원문 보기
        </Link>
      </Meta>
      <Tags>
        {release.tags.map((tag) => (
          <Tag key={tag} $variant={tag}>
            {tag}
          </Tag>
        ))}
      </Tags>

      {hasContent && (
        <Actions>
          <ExpandButton type="button" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? "본문 닫기" : "본문 보기"}
          </ExpandButton>
        </Actions>
      )}

      {expanded && hasContent && (
        <MarkdownPanel>
          <FileTabs>
            {canTranslate ? (
              <>
                <FileTabButton
                  type="button"
                  $active={showKorean}
                  onClick={() => setShowKorean(true)}
                >
                  Korean
                </FileTabButton>
                <FileTabButton
                  type="button"
                  $active={!showKorean}
                  onClick={() => setShowKorean(false)}
                >
                  English
                </FileTabButton>
              </>
            ) : (
              <FileTabButton type="button" $active>
                English
              </FileTabButton>
            )}
          </FileTabs>
          {showKorean && canTranslate && (
            <TranslationNotice>AI가 번역한 내용입니다</TranslationNotice>
          )}
          <Markdown content={showKorean && canTranslate ? release.contentKo ?? "" : release.content} />
          <CommentsSection releaseId={release.id} />
        </MarkdownPanel>
      )}
    </Card>
  );
}
