"use client";

import styled from "styled-components";
import type { TagType } from "@/lib/api/types";

const FilterWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.colors.accent : theme.colors.border};
  background: ${({ $active, theme }) =>
    $active ? "rgba(47, 107, 255, 0.12)" : theme.colors.surface};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.accentStrong : theme.colors.text};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentStrong};
  }
`;

const tags: Array<{ label: string; value: TagType | "ALL" }> = [
  { label: "전체", value: "ALL" },
  { label: "Breaking", value: "BREAKING" },
  { label: "Security", value: "SECURITY" },
  { label: "Feature", value: "FEATURE" },
  { label: "Fix", value: "FIX" },
];

type Props = {
  value: TagType | "ALL";
  onChange: (value: TagType | "ALL") => void;
};

export default function TagFilter({ value, onChange }: Props) {
  return (
    <FilterWrap>
      {tags.map((tag) => (
        <FilterButton
          key={tag.value}
          type="button"
          $active={value === tag.value}
          onClick={() => onChange(tag.value)}
        >
          {tag.label}
        </FilterButton>
      ))}
    </FilterWrap>
  );
}
