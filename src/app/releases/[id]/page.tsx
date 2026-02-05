"use client";

import { useMemo, useState, useEffect } from "react";
import styled from "styled-components";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import { fetchReleaseById, trackReleaseView } from "@/lib/api/relboard";
import { useToast } from "@/lib/hooks/useToast";
import Markdown from "@/components/Markdown";
import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import BookmarkButton from "@/features/bookmarks/components/BookmarkButton";
import CommentsSection from "@/features/comments/components/CommentsSection";

const Page = styled.div`
  display: grid;
  gap: 24px;
  padding-bottom: 120px;
`;

const Hero = styled.section`
  display: grid;
  gap: 12px;
  padding: 20px 24px;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.soft};

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

const HeroRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const StackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const IconBox = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $color, theme }) => $color ?? theme.colors.surfaceRaised};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: #ffffff;
`;

const StackName = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const StackMeta = styled.div`
  display: grid;
  gap: 6px;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const MetaLink = styled.a`
  color: ${({ theme }) => theme.colors.accentStrong};
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;
`;

const Section = styled.section`
  display: grid;
  gap: 12px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text};
`;

const Tabs = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;
  font-weight: 600;
`;

const Panel = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
  display: grid;
  gap: 16px;
`;


const InsightList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Empty = styled.div`
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const TranslationNotice = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(47, 107, 255, 0.12);
  color: ${({ theme }) => theme.colors.accentStrong};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
`;

const CodeBlock = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.border};
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

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function ReleaseDetailPage() {
  const params = useParams<{ id: string }>();
  const releaseId = Number(params?.id ?? 0);
  const { t, language } = useStableTranslation();
  const toast = useToast();
  const [detailTab, setDetailTab] = useState<"INSIGHT" | "FULL">("INSIGHT");
  const [showKorean, setShowKorean] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["release-detail", releaseId],
    queryFn: () => fetchReleaseById(releaseId),
    enabled: Number.isFinite(releaseId) && releaseId > 0,
  });

  useEffect(() => {
    if (data?.id) {
      trackReleaseView(data.id);
    }
  }, [data?.id]);

  const hasInsightContent = useMemo(
    () =>
      Boolean(
        (data?.insights && data.insights.length > 0) ||
          data?.migrationGuide ||
          (data?.technicalKeywords && data.technicalKeywords.length > 0)
      ),
    [data?.insights, data?.migrationGuide, data?.technicalKeywords]
  );

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast(t("releaseDetail.linkCopied"), { tone: "success" });
    } catch {
      toast(t("releaseDetail.linkCopyFail"), { tone: "error" });
    }
  };

  if (isLoading) {
    return <Empty>{t("common.loading")}</Empty>;
  }

  if (isError || !data) {
    return <Empty>{t("common.error")}</Empty>;
  }

  return (
    <Page>
      <Hero>
        <HeroRow>
          <StackInfo>
            <IconBox $color={data.techStack.colorHex ?? undefined}>
              {data.techStack.name.slice(0, 1).toUpperCase()}
            </IconBox>
            <StackMeta>
              <StackName>{data.techStack.name} v{data.version}</StackName>
              <MetaRow>
                <span>{formatDate(data.publishedAt, language)}</span>
                <MetaLink href={data.sourceUrl} target="_blank" rel="noreferrer">
                  {t("common.viewChangelog")}
                </MetaLink>
              </MetaRow>
            </StackMeta>
          </StackInfo>
          <Actions>
            <SubscribeButton techStack={data.techStack} />
            <BookmarkButton release={data} />
            <ActionButton type="button" onClick={handleShare}>
              {t("releaseDetail.share")}
            </ActionButton>
          </Actions>
        </HeroRow>
      </Hero>

      <Section>
        <SectionTitle>{t("releaseDetail.contentTitle")}</SectionTitle>
        <Tabs>
          <TabButton
            type="button"
            $active={detailTab === "INSIGHT"}
            onClick={() => setDetailTab("INSIGHT")}
          >
            {t("insight.tab")}
          </TabButton>
          <TabButton
            type="button"
            $active={detailTab === "FULL"}
            onClick={() => setDetailTab("FULL")}
          >
            {t("insight.fullNote")}
          </TabButton>
        </Tabs>

        {detailTab === "FULL" && (
          <>
            <Tabs>
              {data.contentKo ? (
                <>
                  <TabButton
                    type="button"
                    $active={showKorean}
                    onClick={() => setShowKorean(true)}
                  >
                    {t("language.korean")}
                  </TabButton>
                  <TabButton
                    type="button"
                    $active={!showKorean}
                    onClick={() => setShowKorean(false)}
                  >
                    {t("language.english")}
                  </TabButton>
                </>
              ) : (
                <TabButton type="button" $active>
                  {t("language.english")}
                </TabButton>
              )}
            </Tabs>
            <Panel>
              {showKorean && data.contentKo && (
                <TranslationNotice>{t("releaseCard.translationNotice")}</TranslationNotice>
              )}
              <Markdown
                content={showKorean && data.contentKo ? data.contentKo : data.content}
              />
            </Panel>
          </>
        )}

        {detailTab === "INSIGHT" && (
          <Panel>
            {!hasInsightContent && <Empty>{t("insight.empty")}</Empty>}
            {data.insights && data.insights.length > 0 && (
              <>
                <SectionTitle>{t("insight.highlights")}</SectionTitle>
                <InsightList>
                  {data.insights.map((insight, index) => (
                    <li key={`${insight.title}-${index}`}>
                      <strong>{insight.title}</strong> — {insight.reason}
                    </li>
                  ))}
                </InsightList>
              </>
            )}
            {data.migrationGuide && (
              <>
                <SectionTitle>{t("insight.migrationGuide")}</SectionTitle>
                {data.migrationGuide.description && (
                  <span>{data.migrationGuide.description}</span>
                )}
                {data.migrationGuide.code?.before && (
                  <CodeBlock>{data.migrationGuide.code.before}</CodeBlock>
                )}
                {data.migrationGuide.code?.after && (
                  <CodeBlock>{data.migrationGuide.code.after}</CodeBlock>
                )}
                {data.migrationGuide.code?.snippet &&
                  !data.migrationGuide.code.before &&
                  !data.migrationGuide.code.after && (
                    <CodeBlock>{data.migrationGuide.code.snippet}</CodeBlock>
                  )}
              </>
            )}
            {data.technicalKeywords && data.technicalKeywords.length > 0 && (
              <>
                <SectionTitle>{t("insight.keywords")}</SectionTitle>
                <KeywordChips>
                  {data.technicalKeywords.map((keyword) => (
                    <KeywordChip key={keyword}>{keyword}</KeywordChip>
                  ))}
                </KeywordChips>
              </>
            )}
          </Panel>
        )}
      </Section>

      <Section>
        <CommentsSection releaseId={data.id} />
      </Section>
    </Page>
  );
}
