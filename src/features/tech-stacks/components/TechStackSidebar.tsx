"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

import { fetchTechStacks } from "@/lib/api/relboard";

const SidebarWrap = styled.nav`
  width: 240px;
  flex-shrink: 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Sticky = styled.div`
  position: sticky;
  top: 64px;
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 16px;
  padding-left: 12px;
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
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme, $active }) =>
        $active ? theme.colors.accentStrong : theme.colors.text};
  background: ${({ theme, $active }) =>
        $active ? "rgba(47, 107, 255, 0.08)" : "transparent"};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

export default function TechStackSidebar() {
    const pathname = usePathname();
    const { data: techStacks } = useQuery({
        queryKey: ["tech-stacks"],
        queryFn: fetchTechStacks,
    });

    return (
        <SidebarWrap>
            <Sticky>
                <Title>Tech Stacks</Title>
                <List>
                    <li>
                        <NavLink href="/" $active={pathname === "/"}>
                            All Releases
                        </NavLink>
                    </li>
                    {techStacks?.map((stack) => (
                        <li key={stack.id}>
                            <NavLink
                                href={`/tech-stacks/${stack.name}`}
                                $active={pathname === `/tech-stacks/${stack.name}`}
                            >
                                {stack.name}
                            </NavLink>
                        </li>
                    ))}
                </List>
            </Sticky>
        </SidebarWrap>
    );
}
