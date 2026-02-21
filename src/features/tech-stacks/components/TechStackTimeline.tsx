"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import {
  fetchReleaseById,
  fetchTechStackReleases,
  fetchTechStacks,
} from "@/lib/api/relboard";
import type { TagType } from "@/lib/api/types";
import ReleaseCard from "@/features/releases/components/ReleaseCard";
import ReleaseCardSkeleton from "@/features/releases/components/ReleaseCardSkeleton";
import TagFilter from "@/features/releases/components/TagFilter";
import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import SearchBar from "@/features/releases/components/SearchBar";
import TechStackIssuesList from "./TechStackIssuesList";

const TimelineWrap = styled.section`
  display: grid;
  gap: 20px;
`;

const Heading = styled.div`
  display: grid;
  gap: 6px;
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SearchRow = styled.div`
  max-width: 360px;
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Sentinel = styled.div`
  height: 1px;
`;

const Tabs = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  padding: 7px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  cursor: pointer;
`;

type Props = {
  techStackName: string;
};

export default function TechStackTimeline({ techStackName }: Props) {
  const [tags, setTags] = useState<TagType[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasAutoScrolledRef = useRef(false);
  const { t } = useStableTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const highlightIdParam = searchParams.get("releaseId");
  const highlightId = highlightIdParam ? Number(highlightIdParam) : null;
  const highlightIdValid = Number.isFinite(highlightId ?? NaN);
  const keywordParam = searchParams.get("keyword") ?? "";
  const activeTab = searchParams.get("tab") === "issues" ? "issues" : "releases";

  const { data: techStacks } = useQuery({
    queryKey: ["tech-stacks"],
    queryFn: fetchTechStacks,
  });

  const currentStack = useMemo(
    () => techStacks?.find((stack) => stack.name === techStackName),
    [techStacks, techStackName]
  );

  const releasesQuery = useInfiniteQuery({
    queryKey: ["tech-stack-releases", techStackName, tags, keywordParam],
    queryFn: ({ pageParam = 0 }) =>
      fetchTechStackReleases(techStackName, {
        page: pageParam,
        size: 20,
        tags,
        keyword: keywordParam || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.number + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    releasesQuery;

  const releases = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  );

  const handleKeywordChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const normalized = value.trim();
      if (normalized) {
        params.set("keyword", normalized);
      } else {
        params.delete("keyword");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const handleTabChange = useCallback(
    (nextTab: "releases" | "issues") => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", nextTab);
      if (nextTab === "issues") {
        params.delete("releaseId");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const { data: highlightRelease } = useQuery({
    queryKey: ["release-detail", highlightId],
    queryFn: () => fetchReleaseById(highlightId as number),
    enabled: Boolean(highlightIdValid),
  });

  const orderedReleases = useMemo(() => {
    if (
      !highlightRelease ||
      highlightRelease.techStack.name !== techStackName ||
      !highlightIdValid
    ) {
      return releases;
    }
    const filtered = releases.filter((release) => release.id !== highlightRelease.id);
    return [highlightRelease, ...filtered];
  }, [highlightRelease, releases, techStackName]);

  useEffect(() => {
    if (!highlightIdValid || !highlightId) return;
    if (hasAutoScrolledRef.current) return;
    const target = document.getElementById(`release-${highlightId}`);
    if (target) {
      hasAutoScrolledRef.current = true;
      target.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [highlightId, highlightIdValid, orderedReleases.length]);

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
    <TimelineWrap>
      <Heading>
        <TitleRow>
          <Title>{techStackName}</Title>
          {currentStack && <SubscribeButton techStack={currentStack} />}
        </TitleRow>
        <Sub>{t("techStack.subtitle")}</Sub>
        <Tabs>
          <TabButton
            type="button"
            $active={activeTab === "releases"}
            onClick={() => handleTabChange("releases")}
          >
            {t("techStack.tabReleases")}
          </TabButton>
          <TabButton
            type="button"
            $active={activeTab === "issues"}
            onClick={() => handleTabChange("issues")}
          >
            {t("techStack.tabIssues")}
          </TabButton>
        </Tabs>
      </Heading>

      {activeTab === "releases" && (
        <>
          <SearchRow>
            <SearchBar keyword={keywordParam} onChange={handleKeywordChange} />
          </SearchRow>

          <TagFilter value={tags} onChange={setTags} />
        </>
      )}

      {activeTab === "releases" && (
        <>
          {isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <ReleaseCardSkeleton key={`tech-skeleton-${index}`} />
            ))}

          {isError && <StateMessage>{t("techStack.loadError")}</StateMessage>}

          {!isLoading && releases.length === 0 && (
            <StateMessage>{t("techStack.empty")}</StateMessage>
          )}

          {orderedReleases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              highlighted={Boolean(highlightId && release.id === highlightId)}
            />
          ))}

          {isFetchingNextPage &&
            Array.from({ length: 2 }).map((_, index) => (
              <ReleaseCardSkeleton key={`tech-skeleton-next-${index}`} />
            ))}

          <Sentinel ref={sentinelRef} />
        </>
      )}

      {activeTab === "issues" && <TechStackIssuesList techStackName={techStackName} />}
    </TimelineWrap>
  );
}
