"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import { fetchTechStacks, fetchMySubscriptions } from "@/lib/api/relboard";
import { useAuthStore } from "@/lib/store/authStore";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  height: 100%;
`;

const Sections = styled.div`
  display: grid;
  gap: 20px;
`;

const Section = styled.div`
  display: grid;
  gap: 8px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 12px;
  padding-left: 8px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;


const NavLink = styled(Link) <{ $active: boolean }>`
  display: block;
  padding: 8px 10px;
  border-radius: 10px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : "transparent"};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const Count = styled.span`
  margin-left: auto;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: 16px 0;
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 8px;
`;

const Chip = styled(Link) <{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.surfaceRaised};
  color: ${({ theme, $active }) => ($active ? "#ffffff" : theme.colors.text)};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  transition: all 160ms ease;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};

  &:hover {
    background: ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.borderHover};
    border-color: ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.borderHover};
  }
`;


export default function TechStackSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const keywordParam = searchParams.get("keyword") ?? "";
  const { user } = useAuthStore();
  const { t } = useStableTranslation();

  const { data: techStacks } = useQuery({
    queryKey: ["tech-stacks"],
    queryFn: fetchTechStacks,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: async () => {
      if (!user) return [];
      return fetchMySubscriptions();
    },
    enabled: true,
  });

  const categories = Object.entries(
    (techStacks ?? []).reduce<Record<string, number>>((acc, stack) => {
      acc[stack.category] = (acc[stack.category] ?? 0) + 1;
      return acc;
    }, {})
  );

  const totalCount = techStacks?.length ?? 0;

  return (
    <Container>
      <Sections>
        <Section>
          <Title>{t("sidebar.allCategories")}</Title>
          <List>
            <li>
              <NavLink href="/" $active={pathname === "/" && !activeCategory}>
                <Row>
                  {t("sidebar.allCategories")}
                  <Count>{totalCount}</Count>
                </Row>
              </NavLink>
            </li>
            {categories.map(([category, count]) => (
              <li key={category}>
                <NavLink
                  href={`/?category=${encodeURIComponent(category)}`}
                  $active={pathname === "/" && activeCategory === category}
                >
                  <Row>
                    {category}
                    <Count>{count}</Count>
                  </Row>
                </NavLink>
              </li>
            ))}
          </List>
        </Section>

        {user && subscriptions && subscriptions.length > 0 && (
          <>
            <Divider />
            <Section>
              <Title>{t("sidebar.following")}</Title>
              <ChipList>
                {subscriptions.map((techStack) => {
                  const isActive =
                    pathname === `/tech-stacks/${techStack.name}` ||
                    (pathname === "/" && keywordParam === techStack.name);

                  return (
                    <Chip
                      key={techStack.id}
                      href={
                        pathname === "/"
                          ? `/?keyword=${encodeURIComponent(techStack.name)}`
                          : `/tech-stacks/${techStack.name}`
                      }
                      $active={isActive}
                    >
                      {techStack.name}
                    </Chip>
                  );
                })}
              </ChipList>
            </Section>
          </>
        )}
      </Sections>
    </Container>
  );
}
