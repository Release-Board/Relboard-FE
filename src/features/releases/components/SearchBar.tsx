"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";

const SearchWrap = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 16px;
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(47, 107, 255, 0.15);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

type Props = {
    keyword: string;
    onChange: (value: string) => void;
};

export default function SearchBar({ keyword, onChange }: Props) {
    const [value, setValue] = useState(keyword);

    // Sync internal state if prop changes
    useEffect(() => {
        setValue(keyword);
    }, [keyword]);

    // Debounce handling
    useEffect(() => {
        const handler = setTimeout(() => {
            onChange(value);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [value, onChange]);

    return (
        <SearchWrap>
            <Input
                type="text"
                placeholder="검색어 입력 (제목, 내용)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </SearchWrap>
    );
}
