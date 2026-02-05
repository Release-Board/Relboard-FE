"use client";

import { useMemo } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { useRouter } from "next/navigation";

import type { ReleaseResponse, TagType } from "@/lib/api/types";
import { getTagStyleByTagType } from "@/styles/semantic-tags";
import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import BookmarkButton from "@/features/bookmarks/components/BookmarkButton";

const Card = styled.article<{ $highlight?: boolean }>`
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme, $highlight }) =>
    $highlight ? theme.colors.accentStrong : theme.colors.border};
  padding: 18px;
  display: grid;
  gap: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  transition: all 150ms ease;
  cursor: pointer;
  position: relative;

  ${({ $highlight, theme }) =>
    $highlight &&
    `
      box-shadow: 0 0 0 1px ${theme.colors.accentStrong},
        0 12px 32px rgba(5, 150, 105, 0.28);
    `}

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
  font-style: italic;
  position: relative;
  padding-left: 10px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 2px;
    bottom: 2px;
    width: 2px;
    border-radius: 2px;
    background: ${({ theme }) => theme.colors.borderHover};
  }
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

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

type Props = {
  release: ReleaseResponse;
  onOpen?: () => void;
  highlighted?: boolean;
};

export default function ReleaseCard({ release, onOpen, highlighted }: Props) {
  const hasContent = Boolean(release.content || release.contentKo);
  const { t, language } = useStableTranslation();
  const router = useRouter();

  const summary = useMemo(() => {
    if (release.shortSummary) return release.shortSummary;
    if (release.title) return release.title;
    const source = release.contentKo || release.content || "";
    const firstLine = source.split("\n").find((line) => line.trim().length > 0) ?? "";
    return firstLine;
  }, [release.content, release.contentKo, release.shortSummary, release.title]);

  const openDetails = () => {
    if (!hasContent) return;
    onOpen?.();
    router.push(`/releases/${release.id}`);
  };

  return (
    <Card
      $highlight={highlighted}
      id={`release-${release.id}`}
      onClick={openDetails}
      role="button"
      aria-label={t("common.viewDetails")}
    >
      <Header>
        <IconBox $bgColor={release.techStack.colorHex ?? undefined}>
          {release.techStack.name.slice(0, 1).toUpperCase()}
        </IconBox>
        <div>
          <ReleaseTitle type="button" onClick={openDetails}>
            {release.techStack.name}
          </ReleaseTitle>
        </div>
        <HeaderActions onClick={(event) => event.stopPropagation()}>
          <SubscribeButton techStack={release.techStack} />
          <BookmarkButton release={release} />
        </HeaderActions>
      </Header>

      <TitleRow>
        <Badge $tone="version">v{release.version}</Badge>
        {release.tags.includes("BREAKING") && (
          <Badge $tone="breaking">{t("release.breaking")}</Badge>
        )}
      </TitleRow>

      {summary && <Summary>{summary}</Summary>}

      <Meta>
        <span>{formatDate(release.publishedAt, language)}</span>
        <Link
          href={release.sourceUrl}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          {t("common.viewChangelog")}
        </Link>
      </Meta>

      <Tags>
        {release.tags.map((tag) => (
          <Tag key={tag} $variant={tag}>
            {tag}
          </Tag>
        ))}
      </Tags>

    </Card>
  );
}
