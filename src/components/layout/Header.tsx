"use client";

import styled from "styled-components";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { logout } from "@/lib/api/client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/store/themeStore";
import { useLanguageStore } from "@/lib/store/languageStore";

const HeaderWrap = styled.header`
  height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`;

const HeaderInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};

  @media (max-width: 1024px) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavLink = styled(Link) <{ $active?: boolean }>`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme, $active }) => ($active ? theme.colors.text : theme.colors.muted)};
  text-decoration: none;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchWrap = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  padding: 6px 12px;
  min-width: 240px;
  gap: 8px;
`;

const SearchIcon = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  width: 100%;
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
`;

const IconButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
`;

const LangButton = styled.button`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
  cursor: pointer;
`;

const Button = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const Profile = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const Avatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const AvatarFallback = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accentStrong};
  background: rgba(47, 107, 255, 0.12);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

type HeaderProps = {
  menuButton?: React.ReactNode;
};

export default function Header({ menuButton }: HeaderProps) {
  const { user, isInitialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useStableTranslation();
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggle);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchKeyword.trim().length >= 2) {
      router.push(`/?keyword=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  };

  if (!mounted || !isInitialized) {
    return (
      <HeaderWrap>
        <HeaderInner>
          <Left>
            {menuButton}
            <Logo href="/">Relboard</Logo>
          </Left>
        </HeaderInner>
      </HeaderWrap>
    );
  }

  return (
    <HeaderWrap>
      <HeaderInner>
        <Left>
          {menuButton}
          <Logo href="/">Relboard</Logo>
          <Nav>
            <NavLink href="/" $active={pathname === "/"}>{t("header.overview")}</NavLink>
            <NavLink href="/me/subscriptions" $active={pathname === "/me/subscriptions"}>
              {t("header.following")}
            </NavLink>
            <NavLink href="/me/bookmarks" $active={pathname === "/me/bookmarks"}>
              {t("header.bookmarks")}
            </NavLink>
          </Nav>
        </Left>
        <Actions>
          <SearchWrap>
            <SearchIcon>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </SearchIcon>
            <SearchInput
              placeholder={t("header.searchPlaceholder")}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
          </SearchWrap>
          <IconButton
            type="button"
            aria-label={t("header.themeToggle")}
            onClick={toggleTheme}
            title={t("header.themeToggle")}
          >
            {themeMode === "dark" ? (
              <Moon size={14} />
            ) : (
              <Sun size={14} />
            )}
          </IconButton>
          <LangButton
            type="button"
            aria-label={t("header.languageToggle")}
            onClick={toggleLanguage}
            title={t("header.languageToggle")}
          >
            {language === "ko" ? "KR" : "EN"}
          </LangButton>
          <IconButton type="button" aria-label={t("header.notifications")}>
            <Dot />
          </IconButton>
          {user ? (
            <>
              <Profile>
                {user.profileImageUrl && (
                  <Avatar
                    src={user.profileImageUrl}
                    alt={`${user.nickname} 프로필 이미지`}
                  />
                )}
                {!user.profileImageUrl && (
                  <AvatarFallback aria-hidden="true">
                    {user.nickname?.trim().slice(0, 1) || "U"}
                  </AvatarFallback>
                )}
                <span>
                  {user.nickname}
                  {t("header.profileSuffix")}
                </span>
              </Profile>
              <Button onClick={handleLogout}>{t("header.logout")}</Button>
            </>
          ) : (
            <Button onClick={() => (window.location.href = "/login")}>
              {t("header.login")}
            </Button>
          )}
        </Actions>
      </HeaderInner>
    </HeaderWrap>
  );
}
