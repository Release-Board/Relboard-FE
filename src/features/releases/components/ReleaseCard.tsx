"use client";

import { useState } from "react";
import styled from "styled-components";

import Markdown from "@/components/Markdown";
import type { ReleaseResponse, TagType } from "@/lib/api/types";
import { getTagStyleByTagType } from "@/styles/semantic-tags";

const Card = styled.article`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
  display: grid;
  gap: 14px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
`;

const StackBadge = styled.span`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(47, 107, 255, 0.12);
  color: ${({ theme }) => theme.colors.accentStrong};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const VersionTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.muted};
  font-family: ${({ theme }) => theme.fonts.mono};
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ToggleButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.accentStrong};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const MarkdownPanel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 16px;
`;

const Tag = styled.span<{ $variant: TagType }>`
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  background: ${({ $variant }) => getTagStyleByTagType($variant).background};
  color: ${({ $variant }) => getTagStyleByTagType($variant).color};
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

type Props = {
  release: ReleaseResponse;
};

export default function ReleaseCard({ release }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasContent = Boolean(release.content);

  return (
    <Card>
      <Header>
        <StackBadge>{release.techStack.name}</StackBadge>
      </Header>
      <VersionTitle>v{release.version}</VersionTitle>
      <Meta>
        <span>{formatDate(release.publishedAt)}</span>
        <Link href={release.sourceUrl} target="_blank" rel="noreferrer">
          원문 보기
        </Link>
      </Meta>
      <Tags>
        {release.tags.map((tag) => (
          <Tag key={tag} $variant={tag}>
            {tag}
          </Tag>
        ))}
      </Tags>

      {hasContent && (
        <Actions>
          <ToggleButton type="button" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? "본문 닫기" : "본문 보기"}
          </ToggleButton>
        </Actions>
      )}

      {expanded && hasContent && (
        <MarkdownPanel>
          <Markdown content={release.content} />
        </MarkdownPanel>
      )}
    </Card>
  );
}
