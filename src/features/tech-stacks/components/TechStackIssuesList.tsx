"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { fetchTechStackIssues } from "@/lib/api/relboard";
import type { IssueTagType } from "@/lib/api/types";
import { getReadableLabelStyle } from "@/lib/utils/labelColor";
import SearchBar from "@/features/releases/components/SearchBar";

const Wrap = styled.section`
  display: grid;
  gap: 14px;
`;

const SearchRow = styled.div`
  max-width: 400px;
`;

const FilterControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagFilterWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterButton = styled.button<{
  $active: boolean;
  $color: string;
  $bg: string;
}>`
  border: 1px solid transparent;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};

  &:hover {
    opacity: 1;
  }
`;

const SortSelect = styled.select`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: 6px 10px;
  cursor: pointer;
  width: fit-content;
  flex-shrink: 0;
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
  gap: 16px;
`;

const Card = styled(Link)`
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 18px;
  display: grid;
  gap: 10px;
  text-decoration: none;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  transition: all 150ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
    transform: translateY(-2px);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6);
  }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
`;

const Title = styled.h3`
  margin: 0;
  flex: 1;
  min-width: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 600;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex-shrink: 0;
`;

const Badge = styled.span<{ $state?: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 2px 8px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ $state }) => ($state === "closed" ? "#f87171" : "#10b981")};
  background: ${({ $state }) =>
    $state === "closed" ? "rgba(248, 113, 113, 0.12)" : "rgba(16, 185, 129, 0.12)"};
  border: 1px solid
    ${({ $state }) => ($state === "closed" ? "rgba(248, 113, 113, 0.35)" : "rgba(16, 185, 129, 0.35)")};
`;

const AiBadge = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 2px 8px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accentStrong};
  background: rgba(47, 107, 255, 0.10);
  border: 1px solid rgba(47, 107, 255, 0.25);
`;

const LabelRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const ExternalLink = styled.a`
  color: ${({ theme }) => theme.colors.muted};
  font-weight: 600;
  font-size: ${({ theme }) => theme.fontSizes.xs};
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
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [searchKeyword, setSearchKeyword] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const tags = useMemo(() => (selectedTag ? [selectedTag] : undefined), [selectedTag]);

  const issuesQuery = useInfiniteQuery({
    queryKey: ["tech-stack-issues", techStackName, selectedTag, searchKeyword, sort],
    queryFn: ({ pageParam = 0 }) =>
      fetchTechStackIssues(techStackName, {
        page: pageParam,
        size: 20,
        tags,
        q: searchKeyword || undefined,
        sort,
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
      <SearchRow>
        <SearchBar keyword={searchKeyword} onChange={setSearchKeyword} />
      </SearchRow>

      <FilterControlRow>
        <TagFilterWrap>
          <FilterButton
            type="button"
            $active={!selectedTag}
            $color="#94a3b8"
            $bg="rgba(148, 163, 184, 0.14)"
            onClick={() => setSelectedTag(null)}
          >
            {t("issues.filterAll")}
          </FilterButton>
          <FilterButton
            type="button"
            $active={selectedTag === "BEGINNER_FRIENDLY"}
            $color="#10b981"
            $bg="rgba(16, 185, 129, 0.14)"
            onClick={() => setSelectedTag("BEGINNER_FRIENDLY")}
          >
            {t("issues.filterBeginner")}
          </FilterButton>
          <FilterButton
            type="button"
            $active={selectedTag === "HELP_WANTED"}
            $color="#a78bfa"
            $bg="rgba(167, 139, 250, 0.14)"
            onClick={() => setSelectedTag("HELP_WANTED")}
          >
            {t("issues.filterHelpWanted")}
          </FilterButton>
        </TagFilterWrap>

        <SortSelect
          value={sort}
          onChange={(e) => setSort(e.target.value as "latest" | "oldest")}
          aria-label={t("issues.sortLabel")}
        >
          <option value="latest">{t("issues.sortLatest")}</option>
          <option value="oldest">{t("issues.sortOldest")}</option>
        </SortSelect>
      </FilterControlRow>

      {isLoading && <StateMessage>{t("issues.loading")}</StateMessage>}
      {isError && <StateMessage>{t("issues.error")}</StateMessage>}
      {!isLoading && !isError && issues.length === 0 && (
        <StateMessage>{t("issues.empty")}</StateMessage>
      )}

      {!isLoading && !isError && issues.length > 0 && (
        <List>
          {issues.map((issue) => {
            const hasTranslation = Boolean(
              issue.translation?.titleKoReady ||
              issue.translation?.summaryKoReady ||
              issue.titleKo ||
              issue.bodySummaryKo
            );
            return (
            <Card key={issue.id} href={`/issues/${issue.id}`}>
              <TitleRow>
                <Title>{issue.titleKo ?? issue.title}</Title>
                <BadgeRow>
                  <Badge $state={issue.state?.toLowerCase()}>
                    {(issue.state ?? "").toUpperCase() || t("issues.stateOpen")}
                  </Badge>
                  {hasTranslation && <AiBadge>{t("issues.aiTranslated")}</AiBadge>}
                </BadgeRow>
              </TitleRow>

              {issue.labels.length > 0 && (
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
              )}

              <Meta>
                <span>#{issue.issueNumber}</span>
                <span>{formatDate(issue.githubCreatedAt, language)}</span>
                <span>{t("issues.comments", { count: issue.commentCount })}</span>
                <ExternalLink
                  href={issue.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("issues.openGithub")}
                </ExternalLink>
              </Meta>
            </Card>
            );
          })}
          {isFetchingNextPage && <StateMessage>{t("issues.loading")}</StateMessage>}
          <Sentinel ref={sentinelRef} />
        </List>
      )}
    </Wrap>
  );
}
