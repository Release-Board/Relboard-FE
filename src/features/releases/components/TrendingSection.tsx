"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { useState } from "react";
import Link from "next/link";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { TrendingUp } from "lucide-react";

import { fetchTrendingReleases } from "@/lib/api/relboard";
import type { ReleaseResponse } from "@/lib/api/types";

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
  background: ${({ theme }) => theme.colors.surfaceRaised};
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
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  transform: ${({ $active }) =>
    $active === "DAILY" ? "translateX(100%)" : "translateX(0)"};
  transition: transform 220ms ease;
`;

const List = styled.div`
  display: grid;
  gap: 0;
`;

const RankItem = styled(Link)`
  display: grid;
  grid-template-columns: 60px 40px 48px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  text-decoration: none;
  transition: background 160ms ease;

  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  @media (max-width: 768px) {
    grid-template-columns: 40px 48px 1fr;
    gap: 12px;
    padding: 16px;
  }
`;

const RankNumber = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const RankChange = styled.span<{ $change: "up" | "down" | "same" }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $change, theme }) =>
    $change === "up"
      ? "#10b981"
      : $change === "down"
        ? "#ef4444"
        : theme.colors.muted};

  @media (max-width: 768px) {
    display: none;
  }
`;

const IconBox = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $color }) => $color || "#3b82f6"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
`;

const Content = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

const StackRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StackName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Version = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  font-family: monospace;
`;

const Description = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StatItem = styled.div`
  text-align: center;
  min-width: 50px;
`;

const StatValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.muted};
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #10b981;
  font-size: 13px;
  font-weight: 500;
  min-width: 60px;
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
  text-align: center;
`;

const SkeletonItem = styled.div`
  display: grid;
  grid-template-columns: 60px 40px 48px 1fr auto;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};

  &:first-child {
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "16px"};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.surfaceRaised} 25%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.surfaceRaised} 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

function formatCount(value?: number) {
  if (value === undefined || value === null) return "-";
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
}

function getSummary(release: ReleaseResponse): string {
  if (release.title) return release.title;
  if (release.version) return `v${release.version}`;
  const content = release.contentKo || release.content || "";
  const firstLine = content.split("\n").find((line) => line.trim().length > 0) || "";
  return firstLine.replace(/^#+\s*/, "").slice(0, 100);
}

export default function TrendingSection() {
  const [period, setPeriod] = useState<"WEEKLY" | "DAILY">("WEEKLY");
  const { t } = useStableTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending-releases", period, 10],
    queryFn: () => fetchTrendingReleases({ period, limit: 10 }),
  });

  return (
    <Section>
      <TitleRow>
        <Title>{period === "WEEKLY" ? t("trending.titleWeekly") : t("trending.titleDaily")}</Title>
        <PeriodToggle role="tablist" aria-label={t("trending.toggleLabel")}>
          <ToggleIndicator $active={period} />
          <ToggleButton
            type="button"
            $active={period === "WEEKLY"}
            onClick={() => setPeriod("WEEKLY")}
          >
            {t("trending.periodWeekly")}
          </ToggleButton>
          <ToggleButton
            type="button"
            $active={period === "DAILY"}
            onClick={() => setPeriod("DAILY")}
          >
            {t("trending.periodDaily")}
          </ToggleButton>
        </PeriodToggle>
      </TitleRow>

      {isLoading && (
        <List>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonItem key={`trending-skeleton-${index}`}>
              <SkeletonBox $width="40px" $height="32px" />
              <SkeletonBox $width="24px" $height="16px" />
              <SkeletonBox $width="48px" $height="48px" />
              <div style={{ display: "grid", gap: "8px" }}>
                <SkeletonBox $width="60%" $height="18px" />
                <SkeletonBox $width="80%" $height="14px" />
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                <SkeletonBox $width="50px" $height="32px" />
                <SkeletonBox $width="50px" $height="32px" />
                <SkeletonBox $width="60px" $height="24px" />
              </div>
            </SkeletonItem>
          ))}
        </List>
      )}

      {!isLoading && isError && (
        <StateMessage>{t("trending.loadError")}</StateMessage>
      )}

      {!isLoading && !isError && (!data || data.length === 0) && (
        <StateMessage>
          {period === "WEEKLY" ? t("trending.emptyWeekly") : t("trending.emptyDaily")}
        </StateMessage>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <List>
          {data.map((release, index) => (
            <RankItem key={release.id} href={`/tech-stacks/${release.techStack.name}`}>
              <RankNumber>{index + 1}</RankNumber>
              <RankChange $change="same">-</RankChange>
              <IconBox $color={release.techStack.colorHex ?? undefined}>
                {release.techStack.name.charAt(0).toUpperCase()}
              </IconBox>
              <Content>
                <StackRow>
                  <StackName>{release.techStack.name}</StackName>
                  <Version>v{release.version}</Version>
                </StackRow>
                <Description>{getSummary(release)}</Description>
              </Content>
              <Stats>
                <StatItem>
                  <StatValue>{formatCount(release.periodBookmarkCount ?? release.bookmarkCount)}</StatValue>
                  <StatLabel>{t("trending.bookmarkLabel")}</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{formatCount(release.periodViewCount ?? release.viewCount)}</StatValue>
                  <StatLabel>{t("trending.viewsLabel")}</StatLabel>
                </StatItem>
                <TrendIndicator>
                  <TrendingUp size={14} />
                  {formatCount(release.periodViewCount ?? release.viewCount)}
                </TrendIndicator>
              </Stats>
            </RankItem>
          ))}
        </List>
      )}
    </Section>
  );
}
