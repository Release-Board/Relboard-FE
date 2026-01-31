"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import Markdown from "@/components/Markdown";
import type { ReleaseResponse, TagType } from "@/lib/api/types";
import { getTagStyleByTagType } from "@/styles/semantic-tags";
import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import BookmarkButton from "@/features/bookmarks/components/BookmarkButton";
import { trackReleaseView } from "@/lib/api/relboard";
import CommentsSection from "@/features/comments/components/CommentsSection";

const Card = styled.article`
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 18px;
  display: grid;
  gap: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  transition: all 150ms ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
    transform: translateY(-2px);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
  }
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 12px;
  align-items: center;
`;

const IconBox = styled.div<{ $bgColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $bgColor, theme }) => $bgColor ?? theme.colors.surfaceRaised};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: #ffffff;
`;

const StackBadge = styled.span<{ $color?: string }>`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ $color, theme }) => $color ?? theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const ReleaseTitle = styled.button`
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $tone: "version" | "breaking" }>`
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  color: ${({ theme, $tone }) =>
    $tone === "breaking" ? theme.colors.badgeBreakingText : theme.colors.textSecondary};
  background: ${({ theme, $tone }) =>
    $tone === "breaking" ? theme.colors.badgeBreakingBg : "transparent"};
  border: 1px solid ${({ theme, $tone }) =>
    $tone === "breaking" ? "transparent" : theme.colors.border};
`;

const Summary = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.5;
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const HeaderActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 160ms ease;
  ${Card}:hover & {
    opacity: 1;
  }
`;

const ExpandButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const MarkdownPanel = styled.div`
  position: relative;
  margin-top: 6px;
  padding: 20px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
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

  const summary = useMemo(() => {
    if (release.title) return release.title;
    const source = release.contentKo || release.content || "";
    const firstLine = source.split("\n").find((line) => line.trim().length > 0) ?? "";
    return firstLine;
  }, [release.content, release.contentKo]);

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
        <IconBox $bgColor={release.techStack.colorHex ?? undefined}>
          {release.techStack.name.slice(0, 1).toUpperCase()}
        </IconBox>
        <div>
          <ReleaseTitle
            type="button"
            onClick={() => {
              trackViewOnce();
              if (hasContent) {
                setExpanded(true);
              }
            }}
          >
            {release.techStack.name}
          </ReleaseTitle>
        </div>
        <HeaderActions>
          <SubscribeButton techStack={release.techStack} />
          <BookmarkButton release={release} />
        </HeaderActions>
      </Header>

      <TitleRow>
        <Badge $tone="version">v{release.version}</Badge>
        {release.tags.includes("BREAKING") && <Badge $tone="breaking">Breaking</Badge>}
      </TitleRow>

      {summary && <Summary>{summary}</Summary>}

      <Meta>
        <span>{formatDate(release.publishedAt)}</span>
        <Link href={release.sourceUrl} target="_blank" rel="noreferrer">
          View changelog
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
        <ExpandButton type="button" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? "Collapse" : "View details"}
        </ExpandButton>
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
          <Markdown
            content={showKorean && canTranslate ? release.contentKo ?? "" : release.content}
          />
          <CommentsSection releaseId={release.id} />
        </MarkdownPanel>
      )}
    </Card>
  );
}
