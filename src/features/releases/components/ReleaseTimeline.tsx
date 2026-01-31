"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import { fetchReleases } from "@/lib/api/relboard";
import type { TagType } from "@/lib/api/types";
import ReleaseCard from "./ReleaseCard";
import ReleaseCardSkeleton from "./ReleaseCardSkeleton";
import TagFilter from "./TagFilter";
import CategoryFilter from "./CategoryFilter";
import SearchBar from "./SearchBar";
import TrendingSection from "./TrendingSection";

const TimelineWrap = styled.section`
  display: grid;
  gap: 20px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;
`;

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
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

export default function ReleaseTimeline() {
  const [tags, setTags] = useState<TagType[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [keyword, setKeyword] = useState("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const releasesQuery = useInfiniteQuery({
    queryKey: ["releases", tags, categories, keyword],
    queryFn: ({ pageParam = 0 }) =>
      fetchReleases({ page: pageParam, size: 20, tags, categories, keyword }),
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
      <Controls>
        <SearchBar keyword={keyword} onChange={setKeyword} />
        <TrendingSection />
        <FilterRow>
          <CategoryFilter value={categories} onChange={setCategories} />
        </FilterRow>
        <TagFilter value={tags} onChange={setTags} />
      </Controls>

      {isLoading &&
        Array.from({ length: 4 }).map((_, index) => (
          <ReleaseCardSkeleton key={`release-skeleton-${index}`} />
        ))}

      {isError && (
        <StateMessage>데이터를 불러오지 못했습니다.</StateMessage>
      )}

      {!isLoading && releases.length === 0 && (
        <StateMessage>표시할 릴리즈가 없습니다.</StateMessage>
      )}

      {releases.map((release) => (
        <ReleaseCard key={release.id} release={release} />
      ))}

      {isFetchingNextPage &&
        Array.from({ length: 2 }).map((_, index) => (
          <ReleaseCardSkeleton key={`release-skeleton-next-${index}`} />
        ))}

      <Sentinel ref={sentinelRef} />
    </TimelineWrap>
  );
}
