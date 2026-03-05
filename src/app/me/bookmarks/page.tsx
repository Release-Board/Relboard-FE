"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import ReleaseCard from "@/features/releases/components/ReleaseCard";
import { useBookmarks } from "@/features/bookmarks/hooks/useBookmarks";
import { useIssueBookmarks } from "@/features/bookmarks/hooks/useIssueBookmarks";
import { useAuthStore } from "@/lib/store/authStore";
import { getReadableLabelStyle } from "@/lib/utils/labelColor";
import { useToast } from "@/lib/hooks/useToast";

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

const Tabs = styled.div`
  display: inline-flex;
  gap: 8px;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.border};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : theme.colors.surface};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  padding: 7px 12px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  cursor: pointer;
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

const ToggleButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: 6px 10px;
  cursor: pointer;
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

const IssueList = styled.div`
  display: grid;
  gap: 12px;
`;

const IssueCard = styled.article`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 14px 16px;
  display: grid;
  gap: 10px;
  cursor: pointer;
  transition: border-color 140ms ease, transform 140ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
    transform: translateY(-1px);
  }
`;

const IssueRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

const Meta = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  flex-wrap: wrap;
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ $state?: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 4px 9px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  color: ${({ $state }) => ($state === "closed" ? "#f87171" : "#10b981")};
  background: ${({ $state }) =>
    $state === "closed" ? "rgba(248, 113, 113, 0.12)" : "rgba(16, 185, 129, 0.12)"};
  border: 1px solid
    ${({ $state }) =>
      $state === "closed" ? "rgba(248, 113, 113, 0.35)" : "rgba(16, 185, 129, 0.35)"};
`;

const AiBadge = styled(Badge)`
  color: ${({ theme }) => theme.colors.accentStrong};
  background: rgba(47, 107, 255, 0.14);
  border: 1px solid rgba(47, 107, 255, 0.3);
`;

const IssueTitleLink = styled(Link)`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  text-decoration: none;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const LabelRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Label = styled.span<{ $bg?: string; $fg?: string; $border?: string }>`
  display: inline-flex;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 3px 9px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  color: ${({ $fg }) => $fg ?? "#ffffff"};
  background: ${({ $bg }) => $bg ?? "#4b5563"};
  border: 1px solid ${({ $border }) => $border ?? "rgba(255,255,255,0.22)"};
`;

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
`;

const RemoveButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
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

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

type BookmarkTab = "releases" | "issues";
type ReleaseSort = "bookmarked" | "publishedDesc" | "publishedAsc";
type IssueSort = "bookmarked" | "updatedDesc" | "updatedAsc";

export default function MyBookmarksPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t, language } = useStableTranslation();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<BookmarkTab>("releases");

  const [releasePage, setReleasePage] = useState(0);
  const [releaseSize, setReleaseSize] = useState(10);
  const [releaseSort, setReleaseSort] = useState<ReleaseSort>("bookmarked");

  const [issuePage, setIssuePage] = useState(0);
  const [issueSize, setIssueSize] = useState(10);
  const [issueSort, setIssueSort] = useState<IssueSort>("bookmarked");
  const [showIssueKorean, setShowIssueKorean] = useState(true);

  const {
    bookmarks,
    isLoading: isReleaseLoading,
    page: releasePageInfo,
    refetch: refetchReleaseBookmarks,
  } = useBookmarks({ page: releasePage, size: releaseSize });

  const {
    bookmarks: issueBookmarks,
    isLoading: isIssueLoading,
    page: issuePageInfo,
    refetch: refetchIssueBookmarks,
    removeBookmark: removeIssueBookmark,
  } = useIssueBookmarks({ page: issuePage, size: issueSize });

  const releaseTotalPages = releasePageInfo?.totalPages ?? 0;
  const releaseTotalElements = releasePageInfo?.totalElements ?? bookmarks.length;
  const releaseCurrentPage = releasePageInfo?.number ?? releasePage;

  const issueTotalPages = issuePageInfo?.totalPages ?? 0;
  const issueTotalElements = issuePageInfo?.totalElements ?? issueBookmarks.length;
  const issueCurrentPage = issuePageInfo?.number ?? issuePage;

  const sortedReleaseBookmarks = useMemo(() => {
    if (releaseSort === "bookmarked") {
      const hasBookmarkedAt = bookmarks.some((item) => Boolean(item.bookmarkedAt));
      if (!hasBookmarkedAt) return bookmarks;
      return [...bookmarks].sort((a, b) => {
        const aTime = new Date(a.bookmarkedAt ?? 0).getTime();
        const bTime = new Date(b.bookmarkedAt ?? 0).getTime();
        return bTime - aTime;
      });
    }
    const sorted = [...bookmarks].sort((a, b) => {
      const aTime = new Date(a.publishedAt).getTime();
      const bTime = new Date(b.publishedAt).getTime();
      return releaseSort === "publishedDesc" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [bookmarks, releaseSort]);

  const sortedIssueBookmarks = useMemo(() => {
    if (issueSort === "bookmarked") {
      const hasBookmarkedAt = issueBookmarks.some((item) => Boolean(item.bookmarkedAt));
      if (!hasBookmarkedAt) return issueBookmarks;
      return [...issueBookmarks].sort((a, b) => {
        const aTime = new Date(a.bookmarkedAt ?? 0).getTime();
        const bTime = new Date(b.bookmarkedAt ?? 0).getTime();
        return bTime - aTime;
      });
    }
    const sorted = [...issueBookmarks].sort((a, b) => {
      const aTime = new Date(a.githubUpdatedAt ?? a.githubCreatedAt).getTime();
      const bTime = new Date(b.githubUpdatedAt ?? b.githubCreatedAt).getTime();
      return issueSort === "updatedDesc" ? bTime - aTime : aTime - bTime;
    });
    return sorted;
  }, [issueBookmarks, issueSort]);

  const handleRemoveIssueBookmark = (issueId: string) => {
    removeIssueBookmark.mutate(issueId, {
      onSuccess: () => toast(t("toast.bookmarkRemoved"), { tone: "info" }),
      onError: () => toast(t("toast.bookmarkRemoveFail"), { tone: "error" }),
    });
  };

  const isInteractiveElement = (target: EventTarget | null) => {
    return (
      target instanceof HTMLElement &&
      Boolean(target.closest("a, button, input, select, textarea"))
    );
  };

  if (!user) {
    return (
      <Section>
        <Heading>
          <Title>{t("bookmarks.title")}</Title>
          <Sub>{t("bookmarks.subtitle")}</Sub>
        </Heading>
        <StateMessage>
          {t("bookmarks.loginPrompt")} <LoginLink href="/login">{t("bookmarks.loginLink")}</LoginLink>
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
          <Tabs>
            <TabButton
              type="button"
              $active={activeTab === "releases"}
              onClick={() => setActiveTab("releases")}
            >
              {t("bookmarks.tabReleases")}
            </TabButton>
            <TabButton
              type="button"
              $active={activeTab === "issues"}
              onClick={() => setActiveTab("issues")}
            >
              {t("bookmarks.tabIssues")}
            </TabButton>
          </Tabs>
        </HeaderRow>
      </Heading>

      <Toolbar>
        <Count>
          {t("bookmarks.totalCount", {
            count: activeTab === "releases" ? releaseTotalElements : issueTotalElements,
          })}
        </Count>
        <Divider />

        {activeTab === "releases" ? (
          <>
            <Select
              value={releaseSort}
              onChange={(event) =>
                setReleaseSort(event.target.value as "bookmarked" | "publishedDesc" | "publishedAsc")
              }
              aria-label={t("bookmarks.sortLabel")}
            >
              <option value="bookmarked">{t("bookmarks.sortBookmarked")}</option>
              <option value="publishedDesc">{t("bookmarks.sortPublishedDesc")}</option>
              <option value="publishedAsc">{t("bookmarks.sortPublishedAsc")}</option>
            </Select>
            <Select
              value={releaseSize}
              onChange={(event) => {
                setReleasePage(0);
                setReleaseSize(Number(event.target.value));
              }}
              aria-label={t("bookmarks.perPageLabel")}
            >
              <option value={10}>{t("bookmarks.perPage10")}</option>
              <option value={20}>{t("bookmarks.perPage20")}</option>
              <option value={40}>{t("bookmarks.perPage40")}</option>
            </Select>
            <RefreshButton type="button" onClick={() => refetchReleaseBookmarks()}>
              {t("common.refresh")}
            </RefreshButton>
          </>
        ) : (
          <>
            <Select
              value={issueSort}
              onChange={(event) =>
                setIssueSort(event.target.value as "bookmarked" | "updatedDesc" | "updatedAsc")
              }
              aria-label={t("bookmarks.issueSortLabel")}
            >
              <option value="bookmarked">{t("bookmarks.issueSortBookmarked")}</option>
              <option value="updatedDesc">{t("bookmarks.issueSortUpdatedDesc")}</option>
              <option value="updatedAsc">{t("bookmarks.issueSortUpdatedAsc")}</option>
            </Select>
            <Select
              value={issueSize}
              onChange={(event) => {
                setIssuePage(0);
                setIssueSize(Number(event.target.value));
              }}
              aria-label={t("bookmarks.perPageLabel")}
            >
              <option value={10}>{t("bookmarks.perPage10")}</option>
              <option value={20}>{t("bookmarks.perPage20")}</option>
              <option value={40}>{t("bookmarks.perPage40")}</option>
            </Select>
            <ToggleButton
              type="button"
              onClick={() => setShowIssueKorean((prev) => !prev)}
            >
              {showIssueKorean ? t("issues.showOriginal") : t("issues.showKorean")}
            </ToggleButton>
            <RefreshButton type="button" onClick={() => refetchIssueBookmarks()}>
              {t("common.refresh")}
            </RefreshButton>
          </>
        )}
      </Toolbar>

      {activeTab === "releases" && isReleaseLoading && (
        <StateMessage>{t("bookmarks.loading")}</StateMessage>
      )}

      {activeTab === "releases" && !isReleaseLoading && bookmarks.length === 0 && (
        <StateMessage>{t("bookmarks.empty")}</StateMessage>
      )}

      {activeTab === "releases" && (
        <List>
          {sortedReleaseBookmarks.map((release) => (
            <ReleaseCard key={release.id} release={release} />
          ))}
        </List>
      )}

      {activeTab === "issues" && isIssueLoading && (
        <StateMessage>{t("issues.loading")}</StateMessage>
      )}

      {activeTab === "issues" && !isIssueLoading && issueBookmarks.length === 0 && (
        <StateMessage>{t("bookmarks.issueEmpty")}</StateMessage>
      )}

      {activeTab === "issues" && (
        <IssueList>
          {sortedIssueBookmarks.map((issue) => {
            const hasTranslation = Boolean(
              issue.translation?.titleKoReady ||
                issue.translation?.summaryKoReady ||
                issue.translation?.bodyKoReady ||
                issue.titleKo ||
                issue.bodySummaryKo ||
                issue.bodyKo
            );
            const title = showIssueKorean ? issue.titleKo ?? issue.title : issue.title;
            const isRemoving =
              removeIssueBookmark.isPending &&
              String(removeIssueBookmark.variables ?? "") === String(issue.id);
            const issueDetailHref = `/issues/${issue.id}`;

            return (
              <IssueCard
                key={issue.id}
                role="link"
                tabIndex={0}
                aria-label={`${title} 상세 보기`}
                onClick={(event) => {
                  if (isInteractiveElement(event.target)) return;
                  router.push(issueDetailHref);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  if (isInteractiveElement(event.target)) return;
                  event.preventDefault();
                  router.push(issueDetailHref);
                }}
              >
                <IssueRow>
                  <Meta>
                    <span>#{issue.issueNumber}</span>
                    <span>{formatDate(issue.githubCreatedAt, language)}</span>
                    <span>{t("issues.comments", { count: issue.commentCount })}</span>
                    <span>{issue.techStack?.name ?? "-"}</span>
                  </Meta>
                </IssueRow>

                <BadgeRow>
                  <Badge $state={issue.state?.toLowerCase()}>
                    {(issue.state ?? "").toUpperCase() || t("issues.stateOpen")}
                  </Badge>
                  {hasTranslation && <AiBadge>{t("issues.aiTranslated")}</AiBadge>}
                </BadgeRow>

                <IssueTitleLink href={issueDetailHref}>{title}</IssueTitleLink>

                <LabelRow>
                  {issue.labels.map((label) => {
                    const style = getReadableLabelStyle(label.color);
                    return (
                      <Label
                        key={`${issue.id}-${label.name}`}
                        $bg={style.bg}
                        $fg={style.fg}
                        $border={style.border}
                      >
                        {label.name}
                      </Label>
                    );
                  })}
                </LabelRow>

                <ActionRow>
                  <RemoveButton
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRemoveIssueBookmark(String(issue.id));
                    }}
                    disabled={isRemoving}
                  >
                    {t("bookmark.remove")}
                  </RemoveButton>
                </ActionRow>
              </IssueCard>
            );
          })}
        </IssueList>
      )}

      {activeTab === "releases" && releaseTotalPages > 1 && (
        <Pagination>
          <PageButton
            type="button"
            onClick={() => setReleasePage((prev) => Math.max(prev - 1, 0))}
            disabled={releaseCurrentPage <= 0}
          >
            {t("common.previous")}
          </PageButton>
          <PageInfo>
            {releaseCurrentPage + 1} / {releaseTotalPages}
          </PageInfo>
          <PageButton
            type="button"
            onClick={() =>
              setReleasePage((prev) => Math.min(prev + 1, releaseTotalPages - 1))
            }
            disabled={releaseCurrentPage + 1 >= releaseTotalPages}
          >
            {t("common.next")}
          </PageButton>
        </Pagination>
      )}

      {activeTab === "issues" && issueTotalPages > 1 && (
        <Pagination>
          <PageButton
            type="button"
            onClick={() => setIssuePage((prev) => Math.max(prev - 1, 0))}
            disabled={issueCurrentPage <= 0}
          >
            {t("common.previous")}
          </PageButton>
          <PageInfo>
            {issueCurrentPage + 1} / {issueTotalPages}
          </PageInfo>
          <PageButton
            type="button"
            onClick={() => setIssuePage((prev) => Math.min(prev + 1, issueTotalPages - 1))}
            disabled={issueCurrentPage + 1 >= issueTotalPages}
          >
            {t("common.next")}
          </PageButton>
        </Pagination>
      )}
    </Section>
  );
}
