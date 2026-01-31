"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { useState } from "react";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import { fetchTrendingReleases } from "@/lib/api/relboard";
import ReleaseCard from "@/features/releases/components/ReleaseCard";
import ReleaseCardSkeleton from "@/features/releases/components/ReleaseCardSkeleton";

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
  gap: 16px;
`;

const StateMessage = styled.div`
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export default function TrendingSection() {
  const [period, setPeriod] = useState<"WEEKLY" | "DAILY">("WEEKLY");
  const { t } = useStableTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["trending-releases", period, 5],
    queryFn: () => fetchTrendingReleases({ period, limit: 5 }),
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
            <ReleaseCardSkeleton key={`trending-skeleton-${index}`} />
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
          {data.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </List>
      )}
    </Section>
  );
}
