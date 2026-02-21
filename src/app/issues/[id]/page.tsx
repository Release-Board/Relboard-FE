"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { fetchIssueById } from "@/lib/api/relboard";
import type { IssueResponse, Page } from "@/lib/api/types";
import { getReadableLabelStyle } from "@/lib/utils/labelColor";

const PageWrap = styled.section`
  display: grid;
  gap: 18px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCard = styled.header`
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.surface} 0%,
    ${({ theme }) => theme.colors.surfaceRaised} 100%
  );
  padding: 18px;
  display: grid;
  gap: 12px;
`;

const MainCard = styled.article`
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 18px;
  display: grid;
  gap: 14px;
  min-width: 0;
`;

const SideCard = styled.aside`
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
  display: grid;
  gap: 14px;
  align-content: start;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 4px 9px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
`;

const AiBadge = styled(Badge)`
  color: ${({ theme }) => theme.colors.accentStrong};
  background: rgba(47, 107, 255, 0.12);
  border: 1px solid rgba(47, 107, 255, 0.35);
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TabRow = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const TabButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  padding: 6px 12px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  cursor: pointer;
`;

const Body = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  padding: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const BodyKo = styled(Body)`
  background: linear-gradient(
    180deg,
    rgba(47, 107, 255, 0.08) 0%,
    ${({ theme }) => theme.colors.surfaceRaised} 40%
  );
  border-color: rgba(47, 107, 255, 0.28);
  color: ${({ theme }) => theme.colors.text};
`;

const TranslationNotice = styled.div`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.1);
  color: ${({ theme }) => theme.colors.text};
  padding: 14px;
  display: grid;
  gap: 10px;
`;

const NoticeTitle = styled.strong`
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const NoticeBody = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const LabelRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Label = styled.span<{ $bg?: string; $fg?: string; $border?: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 3px 9px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ $fg }) => $fg ?? "#ffffff"};
  background: ${({ $bg }) => $bg ?? "#4b5563"};
  border: 1px solid ${({ $border }) => $border ?? "rgba(255,255,255,0.22)"};
`;

const ActionLink = styled.a`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentStrong};
  color: #ffffff;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  text-decoration: none;
  padding: 10px 12px;
`;

const GhostAction = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  padding: 10px 12px;
  cursor: pointer;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const MetaList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 10px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const MetaLabel = styled.dt`
  margin: 0;
  font-weight: 700;
`;

const MetaValue = styled.dd`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
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

function getCachedIssue(
  issueId: string,
  queryClient: ReturnType<typeof useQueryClient>
) {
  const pages = queryClient.getQueriesData<Page<IssueResponse>>({
    queryKey: ["issues"],
  });

  for (const [, page] of pages) {
    const match = page?.content?.find((item) => item.id === issueId);
    if (match) return match;
  }
  return undefined;
}

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const issueId = params?.id ?? "";
  const { t, language } = useStableTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"KO" | "ORIGINAL">("KO");

  const cachedIssue = useMemo(
    () => (issueId ? getCachedIssue(issueId, queryClient) : undefined),
    [issueId, queryClient]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["issue-detail", issueId],
    queryFn: () => fetchIssueById(issueId),
    enabled: Boolean(issueId && !cachedIssue),
    initialData: cachedIssue,
  });

  if (isLoading) return <StateMessage>{t("issues.loading")}</StateMessage>;
  if (isError || !data) return <StateMessage>{t("issues.detailError")}</StateMessage>;

  const useKo = tab === "KO";
  const title = useKo
    ? data.titleKo ?? t("issues.translationTitlePending")
    : data.title;
  const hasKoTranslation = Boolean(data.titleKo || data.bodySummaryKo);
  const body = useKo
    ? data.bodySummaryKo ?? t("issues.translationBodyPending")
    : data.body ?? data.bodySummaryKo ?? t("issues.noContent");

  return (
    <PageWrap>
      <HeroCard>
        <BadgeRow>
          <Badge>{(data.state ?? "OPEN").toUpperCase()}</Badge>
          {(data.titleKo || data.bodySummaryKo) && <AiBadge>{t("issues.aiTranslated")}</AiBadge>}
          <Badge>{data.techStack.name}</Badge>
        </BadgeRow>
        <Title>{title}</Title>
        <Meta>
          <span>#{data.issueNumber}</span>
          <span>{data.authorLogin ?? "-"}</span>
          <span>{formatDate(data.githubCreatedAt, language)}</span>
          <span>{t("issues.comments", { count: data.commentCount })}</span>
        </Meta>
      </HeroCard>

      <Grid>
        <MainCard>
          <TabRow>
            <TabButton
              type="button"
              $active={tab === "KO"}
              onClick={() => setTab("KO")}
            >
              {t("issues.showKorean")}
            </TabButton>
            <TabButton
              type="button"
              $active={tab === "ORIGINAL"}
              onClick={() => setTab("ORIGINAL")}
            >
              {t("issues.showOriginal")}
            </TabButton>
          </TabRow>
          {useKo && !hasKoTranslation && (
            <TranslationNotice>
              <NoticeTitle>{t("issues.translationNotReadyTitle")}</NoticeTitle>
              <NoticeBody>{t("issues.translationNotReadyBody")}</NoticeBody>
              <GhostAction type="button" onClick={() => setTab("ORIGINAL")}>
                {t("issues.showOriginal")}
              </GhostAction>
            </TranslationNotice>
          )}

          {useKo ? <BodyKo>{body}</BodyKo> : <Body>{body}</Body>}
        </MainCard>

        <SideCard>
          <SectionTitle>{t("issues.detailMetaTitle")}</SectionTitle>
          <MetaList>
            <MetaLabel>{t("issues.metaTechStack")}</MetaLabel>
            <MetaValue>{data.techStack.name}</MetaValue>
            <MetaLabel>{t("issues.metaCategory")}</MetaLabel>
            <MetaValue>{data.techStack.category}</MetaValue>
            <MetaLabel>{t("issues.metaUpdatedAt")}</MetaLabel>
            <MetaValue>{formatDate(data.githubUpdatedAt ?? data.githubCreatedAt, language)}</MetaValue>
          </MetaList>

          <SectionTitle>{t("issues.detailLabelsTitle")}</SectionTitle>
          <LabelRow>
            {data.labels.map((label) => {
              const style = getReadableLabelStyle(label.color);
              return (
                <Label
                  key={`${data.id}-${label.name}`}
                  $bg={style.bg}
                  $fg={style.fg}
                  $border={style.border}
                >
                  {label.name}
                </Label>
              );
            })}
          </LabelRow>
          <ActionLink href={data.htmlUrl} target="_blank" rel="noreferrer">
            {t("issues.openGithub")}
          </ActionLink>
        </SideCard>
      </Grid>
    </PageWrap>
  );
}
