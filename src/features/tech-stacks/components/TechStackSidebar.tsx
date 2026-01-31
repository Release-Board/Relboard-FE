"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styled from "styled-components";

import { fetchTechStacks, fetchMySubscriptions } from "@/lib/api/relboard";
import { useAuthStore } from "@/lib/store/authStore";

const Container = styled.div`
  padding: 24px 16px;
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

const Chip = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.borderHover};
  }
`;

export default function TechStackSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const { user } = useAuthStore();

  const { data: techStacks } = useQuery({
    queryKey: ["tech-stacks"],
    queryFn: fetchTechStacks,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: fetchMySubscriptions,
    enabled: !!user,
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
      <Section>
        <Title>All Categories</Title>
        <List>
          <li>
            <NavLink href="/" $active={pathname === "/" && !activeCategory}>
              <Row>
                All Categories
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
            <Title>Following</Title>
            <ChipList>
              {subscriptions.map((techStack) => (
                <Chip key={techStack.id} href={`/tech-stacks/${techStack.name}`}>
                  {techStack.name}
                </Chip>
              ))}
            </ChipList>
          </Section>
        </>
      )}
    </Container>
  );
}

