"use client";

import styled from "styled-components";
import type { TagType } from "@/lib/api/types";
import { getTagStyle } from "@/styles/semantic-tags";

const FilterWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterButton = styled.button<{ $active: boolean; $tone: string; $bg: string }>`
  border: 1px solid ${({ $tone }) => $tone};
  background: ${({ $bg }) => $bg};
  color: ${({ $tone }) => $tone};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    border-color: ${({ $tone }) => $tone};
    color: ${({ $tone }) => $tone};
  }

  ${({ $active }) =>
    $active &&
    `
      box-shadow: 0 0 0 3px rgba(47, 107, 255, 0.15);
    `}
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
      {tags.map((tag) => {
        const style = getTagStyle(tag.value);
        return (
        <FilterButton
          key={tag.value}
          type="button"
          $active={value === tag.value}
          $tone={style.color}
          $bg={style.background}
          onClick={() => onChange(tag.value)}
        >
          {tag.label}
        </FilterButton>
      );})}
    </FilterWrap>
  );
}
