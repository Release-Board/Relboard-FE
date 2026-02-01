"use client";

import styled, { useTheme } from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import type { TagType } from "@/lib/api/types";
import { getTagStyleByTagType } from "@/styles/semantic-tags";

const FilterWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterButton = styled.button<{
  $active: boolean;
  $color: string;
  $bg: string;
  $shadow: string;
}>`
  border: 1px solid transparent;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  cursor: pointer;
  transition: all 160ms ease;
  box-shadow: ${({ $shadow }) => $shadow};
  opacity: ${({ $active }) => ($active ? 1 : 0.6)};

  &:hover {
    opacity: 1;
  }
`;

const tagValues: Array<{ label: string; value: TagType | "ALL" }> = [
  { label: "all", value: "ALL" },
  { label: "Breaking", value: "BREAKING" },
  { label: "Security", value: "SECURITY" },
  { label: "Feature", value: "FEATURE" },
  { label: "Fix", value: "FIX" },
];

type Props = {
  value: TagType[];
  onChange: (value: TagType[]) => void;
};

export default function TagFilter({ value, onChange }: Props) {
  const isAll = value.length === 0;
  const { t } = useStableTranslation();
  const theme = useTheme();

  const handleToggle = (tagValue: TagType | "ALL") => {
    if (tagValue === "ALL") {
      onChange([]);
      return;
    }

    if (value.includes(tagValue)) {
      onChange(value.filter((t) => t !== tagValue));
    } else {
      onChange([...value, tagValue]);
    }
  };

  return (
    <FilterWrap>
      {tagValues.map((tag) => {
        const style =
          tag.value === "ALL"
            ? {
                color: theme.colors.tagText,
                background: theme.colors.tagBg,
                boxShadow: "none",
              }
            : getTagStyleByTagType(tag.value as TagType);
        const isActive = tag.value === "ALL" ? isAll : value.includes(tag.value as TagType);

        return (
          <FilterButton
            key={tag.value}
            type="button"
            $active={isActive}
            $color={typeof style.color === "string" ? style.color : ""}
            $bg={typeof style.background === "string" ? style.background : ""}
            $shadow={style.boxShadow}
            onClick={() => handleToggle(tag.value)}
          >
            {tag.value === "ALL" ? t("tag.all") : tag.label}
          </FilterButton>
        );
      })}
    </FilterWrap>
  );
}
