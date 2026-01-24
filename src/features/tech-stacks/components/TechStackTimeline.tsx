"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

import { fetchTechStackReleases } from "@/lib/api/relboard";
import type { TagType } from "@/lib/api/types";
import ReleaseCard from "@/features/releases/components/ReleaseCard";
import ReleaseCardSkeleton from "@/features/releases/components/ReleaseCardSkeleton";
import TagFilter from "@/features/releases/components/TagFilter";

const TimelineWrap = styled.section`
  display: grid;
  gap: 20px;
`;

const Heading = styled.div`
  display: grid;
  gap: 6px;
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

type Props = {
  techStackName: string;
};

export default function TechStackTimeline({ techStackName }: Props) {
  const [activeTag, setActiveTag] = useState<TagType | "ALL">("ALL");
  const tagType = activeTag === "ALL" ? undefined : activeTag;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const releasesQuery = useInfiniteQuery({
    queryKey: ["tech-stack-releases", techStackName, tagType],
    queryFn: ({ pageParam = 0 }) =>
      fetchTechStackReleases(techStackName, {
        page: pageParam,
        size: 20,
        tagType,
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
        <Title>{techStackName}</Title>
        <Sub>해당 스택의 최신 릴리즈 히스토리를 확인하세요.</Sub>
      </Heading>

      <TagFilter value={activeTag} onChange={setActiveTag} />

      {isLoading &&
        Array.from({ length: 4 }).map((_, index) => (
          <ReleaseCardSkeleton key={`tech-skeleton-${index}`} />
        ))}

      {isError && <StateMessage>데이터를 불러오지 못했습니다.</StateMessage>}

      {!isLoading && releases.length === 0 && (
        <StateMessage>표시할 릴리즈가 없습니다.</StateMessage>
      )}

      {releases.map((release) => (
        <ReleaseCard key={release.id} release={release} />
      ))}

      {isFetchingNextPage &&
        Array.from({ length: 2 }).map((_, index) => (
          <ReleaseCardSkeleton key={`tech-skeleton-next-${index}`} />
        ))}

      <Sentinel ref={sentinelRef} />
    </TimelineWrap>
  );
}
