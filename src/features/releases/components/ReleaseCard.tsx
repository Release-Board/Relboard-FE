"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import Markdown from "@/components/Markdown";
import type { ReleaseResponse, TagType } from "@/lib/api/types";
import { getTagStyleByTagType } from "@/styles/semantic-tags";
import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import BookmarkButton from "@/features/bookmarks/components/BookmarkButton";
import { trackReleaseView } from "@/lib/api/relboard";
import CommentsSection from "@/features/comments/components/CommentsSection";

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

const InsightTabs = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
`;

const InsightTabButton = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;
`;

const InsightBlock = styled.div`
  display: grid;
  gap: 12px;
`;

const InsightTitle = styled.h5`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const InsightList = styled.ul`
  margin: 0;
  padding-left: 18px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: grid;
  gap: 8px;
`;

const MigrationCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.badgeBreakingBg};
  background: rgba(220, 38, 38, 0.05);
  padding: 12px;
  display: grid;
  gap: 8px;
`;

const CodeBlock = styled.pre`
  margin: 0;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  overflow: auto;
`;

const KeywordChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const KeywordChip = styled.span`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  background: ${({ theme }) => theme.colors.tagBg};
  color: ${({ theme }) => theme.colors.tagText};
`;

const InsightEmpty = styled.div`
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
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
  const [expanded, setExpanded] = useState(false);
  const [showKorean, setShowKorean] = useState(Boolean(release.contentKo));
  const hasContent = Boolean(release.content || release.contentKo);
  const canTranslate = Boolean(release.contentKo);
  const viewTrackedRef = useRef(false);
  const autoSwitchedRef = useRef(false);
  const { t, language } = useStableTranslation();
  const [detailTab, setDetailTab] = useState<"INSIGHT" | "FULL">("INSIGHT");

  const summary = useMemo(() => {
    if (release.shortSummary) return release.shortSummary;
    if (release.title) return release.title;
    const source = release.contentKo || release.content || "";
    const firstLine = source.split("\n").find((line) => line.trim().length > 0) ?? "";
    return firstLine;
  }, [release.content, release.contentKo, release.shortSummary, release.title]);

  const hasInsightContent = useMemo(
    () =>
      Boolean(
        (release.insights && release.insights.length > 0) ||
          release.migrationGuide ||
          (release.technicalKeywords && release.technicalKeywords.length > 0)
      ),
    [release.insights, release.migrationGuide, release.technicalKeywords]
  );

  const trackViewOnce = () => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;
    trackReleaseView(release.id);
  };

  const openDetails = () => {
    if (!hasContent) return;
    if (!expanded) {
      onOpen?.();
    }
    setExpanded(true);
  };

  useEffect(() => {
    if (expanded) {
      trackViewOnce();
    }
  }, [expanded]);

  useEffect(() => {
    if (!expanded) {
      autoSwitchedRef.current = false;
      return;
    }
    if (!autoSwitchedRef.current && !hasInsightContent) {
      setDetailTab("FULL");
      autoSwitchedRef.current = true;
    }
  }, [expanded, hasInsightContent]);

  return (
    <Card $highlight={highlighted} id={`release-${release.id}`}>
      <Header>
        <IconBox $bgColor={release.techStack.colorHex ?? undefined}>
          {release.techStack.name.slice(0, 1).toUpperCase()}
        </IconBox>
        <div>
          <ReleaseTitle
            type="button"
            onClick={() => {
              trackViewOnce();
              openDetails();
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
        {release.tags.includes("BREAKING") && (
          <Badge $tone="breaking">{t("release.breaking")}</Badge>
        )}
      </TitleRow>

      {summary && <Summary>{summary}</Summary>}

      <Meta>
        <span>{formatDate(release.publishedAt, language)}</span>
        <Link href={release.sourceUrl} target="_blank" rel="noreferrer">
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

      {hasContent && (
        <ExpandButton
          type="button"
          onClick={() => {
            if (expanded) {
              setExpanded(false);
              return;
            }
            openDetails();
          }}
        >
          {expanded ? t("common.collapse") : t("common.viewDetails")}
        </ExpandButton>
      )}

      {expanded && hasContent && (
        <MarkdownPanel>
          <InsightTabs>
            <InsightTabButton
              type="button"
              $active={detailTab === "INSIGHT"}
              onClick={() => setDetailTab("INSIGHT")}
            >
              {t("insight.tab")}
            </InsightTabButton>
            <InsightTabButton
              type="button"
              $active={detailTab === "FULL"}
              onClick={() => setDetailTab("FULL")}
            >
              {t("insight.fullNote")}
            </InsightTabButton>
          </InsightTabs>

          {detailTab === "INSIGHT" && (
            <InsightBlock>
              {!hasInsightContent && (
                <InsightEmpty>{t("insight.empty")}</InsightEmpty>
              )}
              {release.insights && release.insights.length > 0 && (
                <>
                  <InsightTitle>{t("insight.highlights")}</InsightTitle>
                  <InsightList>
                    {release.insights.map((insight, index) => (
                      <li key={`${insight.title}-${index}`}>
                        <strong>{insight.title}</strong> — {insight.reason}
                      </li>
                    ))}
                  </InsightList>
                </>
              )}

              {release.migrationGuide && (
                <>
                  <InsightTitle>{t("insight.migrationGuide")}</InsightTitle>
                  <MigrationCard>
                    {release.migrationGuide.description && (
                      <span>{release.migrationGuide.description}</span>
                    )}
                    {release.migrationGuide.code?.before && (
                      <CodeBlock>{release.migrationGuide.code.before}</CodeBlock>
                    )}
                    {release.migrationGuide.code?.after && (
                      <CodeBlock>{release.migrationGuide.code.after}</CodeBlock>
                    )}
                    {release.migrationGuide.code?.snippet &&
                      !release.migrationGuide.code.before &&
                      !release.migrationGuide.code.after && (
                        <CodeBlock>{release.migrationGuide.code.snippet}</CodeBlock>
                      )}
                  </MigrationCard>
                </>
              )}

              {release.technicalKeywords && release.technicalKeywords.length > 0 && (
                <>
                  <InsightTitle>{t("insight.keywords")}</InsightTitle>
                  <KeywordChips>
                    {release.technicalKeywords.map((keyword) => (
                      <KeywordChip key={keyword}>{keyword}</KeywordChip>
                    ))}
                  </KeywordChips>
                </>
              )}
            </InsightBlock>
          )}

          {detailTab === "FULL" && (
            <>
              <FileTabs>
                {canTranslate ? (
                  <>
                    <FileTabButton
                      type="button"
                      $active={showKorean}
                      onClick={() => setShowKorean(true)}
                    >
                      {t("language.korean")}
                    </FileTabButton>
                    <FileTabButton
                      type="button"
                      $active={!showKorean}
                      onClick={() => setShowKorean(false)}
                    >
                      {t("language.english")}
                    </FileTabButton>
                  </>
                ) : (
                  <FileTabButton type="button" $active>
                    {t("language.english")}
                  </FileTabButton>
                )}
              </FileTabs>
              {showKorean && canTranslate && (
                <TranslationNotice>{t("releaseCard.translationNotice")}</TranslationNotice>
              )}
              <Markdown
                content={showKorean && canTranslate ? release.contentKo ?? "" : release.content}
              />
              <CommentsSection releaseId={release.id} />
            </>
          )}
        </MarkdownPanel>
      )}
    </Card>
  );
}
