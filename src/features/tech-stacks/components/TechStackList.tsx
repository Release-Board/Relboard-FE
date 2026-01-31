"use client";

import { useMemo } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { fetchTechStacks } from "@/lib/api/relboard";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import type { TechStackResponse } from "@/lib/api/types";

const Section = styled.section`
  display: grid;
  gap: 16px;
`;

const List = styled.div`
  display: grid;
  gap: 16px;
`;

const Card = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 18px 20px;
  display: grid;
  gap: 12px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  transition: all 150ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
    transform: translateY(-1px);
  }
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  align-items: center;
`;

const IconBox = styled.div<{ $bgColor?: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $bgColor, theme }) => $bgColor ?? theme.colors.surfaceRaised};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: #ffffff;
`;

const Title = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Description = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Meta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

function formatDate(value?: string | null, locale?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale ?? "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function filterStacks(
  stacks: TechStackResponse[],
  category: string | null,
  keyword: string
) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  return stacks.filter((stack) => {
    if (category && stack.category !== category) return false;
    if (!normalizedKeyword) return true;
    const name = stack.name.toLowerCase();
    const desc = (stack.description ?? "").toLowerCase();
    return name.includes(normalizedKeyword) || desc.includes(normalizedKeyword);
  });
}

export default function TechStackList() {
  const { t, language } = useStableTranslation();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const keywordParam = searchParams.get("keyword") ?? "";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tech-stacks"],
    queryFn: fetchTechStacks,
  });

  const stacks = useMemo(
    () => filterStacks(data ?? [], categoryParam, keywordParam),
    [data, categoryParam, keywordParam]
  );

  if (isLoading) {
    return <StateMessage>{t("techStackList.loading")}</StateMessage>;
  }

  if (isError) {
    return <StateMessage>{t("techStackList.error")}</StateMessage>;
  }

  if (stacks.length === 0) {
    return <StateMessage>{t("techStackList.empty")}</StateMessage>;
  }

  return (
    <Section>
      <List>
        {stacks.map((stack) => (
          <Card key={stack.id}>
            <Header>
              <IconBox $bgColor={stack.colorHex ?? undefined}>
                {stack.name.slice(0, 1).toUpperCase()}
              </IconBox>
              <Title href={`/tech-stacks/${stack.name}`}>{stack.name}</Title>
              <SubscribeButton techStack={stack} />
            </Header>
            {stack.description && <Description>{stack.description}</Description>}
            <Meta>
              {t("techStackList.latest", {
                version: stack.latestVersion,
                date: formatDate(stack.latestReleaseAt, language),
              })}
            </Meta>
          </Card>
        ))}
      </List>
    </Section>
  );
}
