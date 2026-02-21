"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { fetchTechStackIssues } from "@/lib/api/relboard";
import type { IssueTagType } from "@/lib/api/types";
import { getReadableLabelStyle } from "@/lib/utils/labelColor";

const Wrap = styled.section`
  display: grid;
  gap: 14px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  cursor: pointer;
`;

const ToggleButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: 6px 10px;
  cursor: pointer;
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const List = styled.div`
  display: grid;
  gap: 12px;
`;

const Card = styled(Link)`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 14px 16px;
  display: grid;
  gap: 10px;
  text-decoration: none;
  min-width: 0;
  transition: border-color 140ms ease, transform 140ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
    transform: translateY(-1px);
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const Meta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $state?: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 4px 9px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  color: ${({ $state }) => ($state === "closed" ? "#f87171" : "#10b981")};
  background: ${({ $state }) =>
    $state === "closed" ? "rgba(248, 113, 113, 0.12)" : "rgba(16, 185, 129, 0.12)"};
  border: 1px solid
    ${({ $state }) => ($state === "closed" ? "rgba(248, 113, 113, 0.35)" : "rgba(16, 185, 129, 0.35)")};
`;

const AiBadge = styled(Badge)`
  color: ${({ theme }) => theme.colors.accentStrong};
  background: rgba(47, 107, 255, 0.14);
  border: 1px solid rgba(47, 107, 255, 0.3);
`;

const Title = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  overflow-wrap: anywhere;
  word-break: break-word;
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

const Sentinel = styled.div`
  height: 1px;
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

export default function TechStackIssuesList({ techStackName }: { techStackName: string }) {
  const { t, language } = useStableTranslation();
  const [selectedTag, setSelectedTag] = useState<IssueTagType | null>(null);
  const [showKorean, setShowKorean] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tags = useMemo(() => (selectedTag ? [selectedTag] : undefined), [selectedTag]);

  const issuesQuery = useInfiniteQuery({
    queryKey: ["tech-stack-issues", techStackName, selectedTag],
    queryFn: ({ pageParam = 0 }) =>
      fetchTechStackIssues(techStackName, {
        page: pageParam,
        size: 20,
        tags,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage.page ?? lastPage.number ?? 0) + 1;
      if (typeof lastPage.hasNext === "boolean") {
        return lastPage.hasNext ? nextPage : undefined;
      }
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = issuesQuery;
  const issues = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Wrap>
      <FilterRow>
        <FilterButton
          type="button"
          $active={!selectedTag}
          onClick={() => setSelectedTag(null)}
        >
          {t("issues.filterAll")}
        </FilterButton>
        <FilterButton
          type="button"
          $active={selectedTag === "BEGINNER_FRIENDLY"}
          onClick={() => setSelectedTag("BEGINNER_FRIENDLY")}
        >
          {t("issues.filterBeginner")}
        </FilterButton>
        <FilterButton
          type="button"
          $active={selectedTag === "HELP_WANTED"}
          onClick={() => setSelectedTag("HELP_WANTED")}
        >
          {t("issues.filterHelpWanted")}
        </FilterButton>
        <ToggleButton type="button" onClick={() => setShowKorean((prev) => !prev)}>
          {showKorean ? t("issues.showOriginal") : t("issues.showKorean")}
        </ToggleButton>
      </FilterRow>

      {isLoading && <StateMessage>{t("issues.loading")}</StateMessage>}
      {isError && <StateMessage>{t("issues.error")}</StateMessage>}
      {!isLoading && !isError && issues.length === 0 && (
        <StateMessage>{t("issues.empty")}</StateMessage>
      )}

      {!isLoading && !isError && issues.length > 0 && (
        <List>
          {issues.map((issue) => (
            <Card key={issue.id} href={`/issues/${issue.id}`}>
              <Row>
                <Meta>
                  <span>#{issue.issueNumber}</span>
                  <span>{formatDate(issue.githubCreatedAt, language)}</span>
                  <span>{t("issues.comments", { count: issue.commentCount })}</span>
                </Meta>
              </Row>

              <BadgeRow>
                <Badge $state={issue.state?.toLowerCase()}>
                  {(issue.state ?? "").toUpperCase() || t("issues.stateOpen")}
                </Badge>
                {(issue.translation?.titleKoReady ||
                  issue.translation?.summaryKoReady ||
                  issue.titleKo ||
                  issue.bodySummaryKo) && (
                  <AiBadge>{t("issues.aiTranslated")}</AiBadge>
                )}
              </BadgeRow>

              <Title>{showKorean ? issue.titleKo ?? issue.title : issue.title}</Title>

              <LabelRow>
                {issue.labels.map((label) => {
                  const style = getReadableLabelStyle(label.color);
                  return (
                    <Label
                      key={`${issue.id}-${label.name}`}
                      $bg={style.bg}
                      $fg={style.fg}
                      $border={style.border}
                    >
                      {label.name}
                    </Label>
                  );
                })}
              </LabelRow>
            </Card>
          ))}
          {isFetchingNextPage && <StateMessage>{t("issues.loading")}</StateMessage>}
          <Sentinel ref={sentinelRef} />
        </List>
      )}
    </Wrap>
  );
}
