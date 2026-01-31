"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import ReleaseCard from "@/features/releases/components/ReleaseCard";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useAuthStore } from "@/lib/store/authStore";

const Section = styled.section`
  display: grid;
  gap: 20px;
`;

const Heading = styled.div`
  display: grid;
  gap: 6px;
`;

const HeaderRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  justify-content: space-between;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

const Count = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const Select = styled.select`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const RefreshButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 18px;
  background: ${({ theme }) => theme.colors.border};
`;

const List = styled.div`
  display: grid;
  gap: 20px;
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 0 8px;
`;

const PageInfo = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const PageButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const LoginLink = styled(Link)`
  color: ${({ theme }) => theme.colors.accentStrong};
  font-weight: 600;
  text-decoration: none;
`;

export default function MyBookmarksPage() {
  const { user } = useAuthStore();
  const { t } = useStableTranslation();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<"bookmarked" | "publishedDesc" | "publishedAsc">(
    "bookmarked"
  );

  const { bookmarks, isLoading, page: pageInfo, refetch } = useBookmarks({ page, size });

  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? bookmarks.length;
  const currentPage = pageInfo?.number ?? page;

  const sortedBookmarks = useMemo(() => {
    if (sort === "bookmarked") return bookmarks;
    const sorted = [...bookmarks].sort((a, b) => {
      const aTime = new Date(a.publishedAt).getTime();
      const bTime = new Date(b.publishedAt).getTime();
      return sort === "publishedDesc" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [bookmarks, sort]);

  if (!user) {
    return (
      <Section>
        <Heading>
          <Title>{t("bookmarks.title")}</Title>
          <Sub>{t("bookmarks.subtitle")}</Sub>
        </Heading>
        <StateMessage>
          {t("bookmarks.loginPrompt")}{" "}
          <LoginLink href="/login">{t("bookmarks.loginLink")}</LoginLink>
        </StateMessage>
      </Section>
    );
  }

  return (
    <Section>
      <Heading>
        <HeaderRow>
          <div>
            <Title>{t("bookmarks.title")}</Title>
            <Sub>{t("bookmarks.subtitle")}</Sub>
          </div>
          <Toolbar>
            <Count>{t("bookmarks.totalCount", { count: totalElements })}</Count>
            <Divider />
            <Select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as "bookmarked" | "publishedDesc" | "publishedAsc")
              }
              aria-label={t("bookmarks.sortLabel")}
            >
              <option value="bookmarked">{t("bookmarks.sortBookmarked")}</option>
              <option value="publishedDesc">{t("bookmarks.sortPublishedDesc")}</option>
              <option value="publishedAsc">{t("bookmarks.sortPublishedAsc")}</option>
            </Select>
            <Select
              value={size}
              onChange={(event) => {
                setPage(0);
                setSize(Number(event.target.value));
              }}
              aria-label={t("bookmarks.perPageLabel")}
            >
              <option value={10}>{t("bookmarks.perPage10")}</option>
              <option value={20}>{t("bookmarks.perPage20")}</option>
              <option value={40}>{t("bookmarks.perPage40")}</option>
            </Select>
            <RefreshButton type="button" onClick={() => refetch()}>
              {t("common.refresh")}
            </RefreshButton>
          </Toolbar>
        </HeaderRow>
      </Heading>

      {isLoading && <StateMessage>{t("bookmarks.loading")}</StateMessage>}

      {!isLoading && bookmarks.length === 0 && (
        <StateMessage>{t("bookmarks.empty")}</StateMessage>
      )}

      <List>
        {sortedBookmarks.map((release) => (
          <ReleaseCard key={release.id} release={release} />
        ))}
      </List>

      {totalPages > 1 && (
        <Pagination>
          <PageButton
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage <= 0}
          >
            {t("common.previous")}
          </PageButton>
          <PageInfo>
            {currentPage + 1} / {totalPages}
          </PageInfo>
          <PageButton
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage + 1 >= totalPages}
          >
            {t("common.next")}
          </PageButton>
        </Pagination>
      )}
    </Section>
  );
}
