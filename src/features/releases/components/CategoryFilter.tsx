"use client";

import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";
import { fetchCategories } from "@/lib/api/relboard";

const FilterWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.surfaceRaised)};
  color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.muted)};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme, $active }) => ($active ? "#fff" : theme.colors.accent)};
  }
`;

type Props = {
    value: string[];
    onChange: (value: string[]) => void;
};

export default function CategoryFilter({ value, onChange }: Props) {
    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    const handleToggle = (category: string) => {
        if (value.includes(category)) {
            onChange(value.filter((c) => c !== category));
        } else {
            onChange([...value, category]);
        }
    };

    if (categories.length === 0) return null;

    return (
        <FilterWrap>
            {categories.map((category) => (
                <FilterButton
                    key={category}
                    type="button"
                    $active={value.includes(category)}
                    onClick={() => handleToggle(category)}
                >
                    {category}
                </FilterButton>
            ))}
        </FilterWrap>
    );
}
