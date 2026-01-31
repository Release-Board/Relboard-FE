"use client";

import { useQuery } from "@tanstack/react-query";
import styled, { keyframes } from "styled-components";
import { useState } from "react";

import { fetchTrendingReleases, trackReleaseView } from "@/lib/api/relboard";
import type { ReleaseResponse } from "@/lib/api/types";
import Modal from "@/components/common/Modal";
import Markdown from "@/components/Markdown";
import CommentsSection from "@/features/comments/components/CommentsSection";

const Section = styled.section`
  display: grid;
  gap: 16px;
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: clamp(20px, 2.2vw, 26px);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

const PeriodToggle = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: #f1f3f5;
  position: relative;
  overflow: hidden;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  border: none;
  background: transparent;
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.muted)};
  padding: 6px 14px;
  border-radius: 999px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  cursor: pointer;
  transition: all 160ms ease;
  position: relative;
  z-index: 1;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const ToggleIndicator = styled.span<{ $active: "WEEKLY" | "DAILY" }>`
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 6px);
  height: calc(100% - 8px);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.18);
  transform: ${({ $active }) =>
    $active === "DAILY" ? "translateX(100%)" : "translateX(0)"};
  transition: transform 220ms ease;
`;

const shimmer = keyframes`
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
`;

const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-areas:
    "hero hero second third"
    "hero hero fourth fifth";

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      "hero hero"
      "second third"
      "fourth fifth";
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "hero"
      "second"
      "third"
      "fourth"
      "fifth";
  }
`;

const Card = styled.button<{ $rank: number; $area: string }>`
  text-align: left;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: ${({ $rank }) => ($rank === 1 ? "22px" : $rank <= 3 ? "18px" : "14px")};
  display: grid;
  gap: ${({ $rank }) => ($rank >= 4 ? "8px" : "10px")};
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  min-height: ${({ $rank }) => ($rank === 1 ? "260px" : $rank <= 3 ? "200px" : "140px")};
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
  grid-area: ${({ $area }) => $area};
  align-content: ${({ $rank }) => ($rank >= 4 ? "center" : "start")};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 36px rgba(31, 38, 135, 0.18);
    border-color: rgba(47, 107, 255, 0.5);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Stack = styled.span<{ $color?: string }>`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 800;
  color: ${({ $color, theme }) => $color ?? theme.colors.accentStrong};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const RankNumber = styled.span<{ $rank: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: "Outfit", ${({ theme }) => theme.fonts.sans}, sans-serif;
  font-weight: 800;
  font-size: ${({ $rank }) =>
    $rank === 1 ? "3.5rem" : $rank <= 3 ? "2.5rem" : "2rem"};
  line-height: 1;
  opacity: ${({ $rank }) => ($rank >= 4 ? 0.5 : 1)};
  background: ${({ $rank }) =>
    $rank === 1
      ? "linear-gradient(45deg, #FFD700, #FDB931)"
      : $rank === 2
        ? "linear-gradient(45deg, #E0E0E0, #B0BEC5)"
        : $rank === 3
          ? "linear-gradient(45deg, #CD7F32, #B87333)"
          : "linear-gradient(45deg, #94a3b8, #64748b)"};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ReleaseTitle = styled.h4<{ $compact?: boolean }>`
  margin: 0;
  font-size: ${({ theme, $compact }) =>
    $compact ? theme.fontSizes.sm : theme.fontSizes.md};
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.25;
`;

const Meta = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;



const Skeleton = styled.div<{ $area: string }>`
  border-radius: 22px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: linear-gradient(90deg, rgba(240, 244, 255, 0.7), rgba(255, 255, 255, 0.9));
  background-size: 200% 200%;
  animation: ${shimmer} 1.4s ease infinite;
  min-height: 200px;
  grid-area: ${({ $area }) => $area};
`;

const StateMessage = styled.div`
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ModalMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const SecondaryButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const PrimaryLink = styled.a`
  border: 1px solid ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentStrong};
  color: #ffffff;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  text-decoration: none;
  font-weight: 600;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

function formatMetaCount(value?: number, suffix?: string) {
  if (value === undefined || value === null) return "-";
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}천${suffix ?? ""}`;
  }
  return `${value}${suffix ?? ""}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default function TrendingSection() {
  const [period, setPeriod] = useState<"WEEKLY" | "DAILY">("WEEKLY");
  const [selectedRelease, setSelectedRelease] = useState<ReleaseResponse | null>(
    null
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending-releases", period, 5],
    queryFn: () => fetchTrendingReleases({ period, limit: 5 }),
  });

  const periodLabel = period === "WEEKLY" ? "이번 주" : "오늘";
  const areas = ["hero", "second", "third", "fourth", "fifth"];

  return (
    <Section>
      <TitleRow>
        <Title>{periodLabel} 핫한 릴리즈</Title>
        <PeriodToggle role="tablist" aria-label="트렌딩 기간 선택">
          <ToggleIndicator $active={period} />
          <ToggleButton
            type="button"
            $active={period === "WEEKLY"}
            onClick={() => setPeriod("WEEKLY")}
          >
            WEEKLY
          </ToggleButton>
          <ToggleButton
            type="button"
            $active={period === "DAILY"}
            onClick={() => setPeriod("DAILY")}
          >
            DAILY
          </ToggleButton>
        </PeriodToggle>
      </TitleRow>

      {isLoading && (
        <Grid>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`trending-skeleton-${index}`} $area={areas[index] ?? "hero"} />
          ))}
        </Grid>
      )}

      {!isLoading && isError && (
        <StateMessage>지금은 인기 릴리즈를 불러오지 못했어요.</StateMessage>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <StateMessage>{periodLabel} 핫한 릴리즈가 아직 없습니다.</StateMessage>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <Grid>
          {data.map((release, index) => (
            <Card
              key={release.id}
              type="button"
              $rank={index + 1}
              $area={areas[index] ?? "hero"}
              onClick={() => {
                trackReleaseView(release.id);
                setSelectedRelease(release);
              }}
            >
              <CardHeader>
                <Stack $color={release.techStack.colorHex ?? undefined}>
                  {release.techStack.name}
                </Stack>
                <RankNumber $rank={index + 1}>{index + 1}</RankNumber>
              </CardHeader>
              <ReleaseTitle $compact={index >= 3}>
                v{release.version}
              </ReleaseTitle>
              <Meta>
                <span>{formatDate(release.publishedAt)}</span>
              </Meta>
              <Meta>
                <span>조회 {formatMetaCount(release.viewCount)}</span>
                <span>북마크 {formatMetaCount(release.bookmarkCount)}</span>
              </Meta>
            </Card>
          ))}
        </Grid>
      )}

      <Modal
        open={Boolean(selectedRelease)}
        onClose={() => setSelectedRelease(null)}
        title={selectedRelease?.title || (selectedRelease ? `v${selectedRelease.version}` : "")}
        description={selectedRelease ? selectedRelease.techStack.name : undefined}
        size="lg"
        actionsAlign="end"
        actions={
          <ModalActions>
            <SecondaryButton type="button" onClick={() => setSelectedRelease(null)}>
              닫기
            </SecondaryButton>
            {selectedRelease && (
              <PrimaryLink href={selectedRelease.sourceUrl} target="_blank" rel="noreferrer">
                원문 보기
              </PrimaryLink>
            )}
          </ModalActions>
        }
      > 
        {selectedRelease && (
          <>
            <ModalMeta>
              <span>v{selectedRelease.version}</span>
              <span>{formatDate(selectedRelease.publishedAt)}</span>
              <span>조회 {formatMetaCount(selectedRelease.viewCount)}</span>
              <span>북마크 {formatMetaCount(selectedRelease.bookmarkCount)}</span>
            </ModalMeta>
            <Markdown
              content={selectedRelease.contentKo || selectedRelease.content || ""}
            />
            <CommentsSection releaseId={selectedRelease.id} />
          </>
        )}
      </Modal>
    </Section>
  );
}
