"use client";

import styled from "styled-components";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { logout } from "@/lib/api/client";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import {
  Bookmark,
  Flame,
  Home,
  Info,
  MessageCircle,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import { useThemeStore } from "@/lib/store/themeStore";
import { useLanguageStore } from "@/lib/store/languageStore";
import { trackEvent } from "@/lib/analytics/ga";
import { useContactStore } from "@/lib/store/contactStore";
import { useIsHydrated } from "@/lib/hooks/useIsHydrated";

const HeaderWrap = styled.header`
  height: 64px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  z-index: 1000;
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
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 1024px) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
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

  @media (max-width: 768px) {
    display: none;
  }
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
  flex-shrink: 0;
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

  @media (max-width: 768px) {
    display: none;
  }
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

  @media (max-width: 768px) {
    display: none;
  }
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


const ProfileMenuWrap = styled.div`
  position: relative;
  display: inline-flex;
`;

const ProfileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
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

const ProfileMenu = styled.div`
  position: fixed;
  min-width: 160px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  padding: 8px;
  display: grid;
  gap: 4px;
  z-index: 1001;
`;

const MobileMenuOverlay = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    opacity: ${({ $open }) => ($open ? 1 : 0)};
    pointer-events: ${({ $open }) => ($open ? "auto" : "none")};
    transition: opacity 220ms ease;
    z-index: 119;
  }
`;

const MobileMenuDrawer = styled.div<{ $open: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: ${({ theme }) => theme.colors.surface};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    padding: 16px;
    flex-direction: column;
    gap: 10px;
    z-index: 120;
    transform: translateX(${({ $open }) => ($open ? "0" : "-100%")});
    transition: transform 300ms cubic-bezier(0.34, 1.2, 0.64, 1);
    box-shadow: 8px 0 24px rgba(0, 0, 0, 0.2);
    will-change: transform;
  }
`;


const MobileMenuHeader = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

const MobileMenuClose = styled(IconButton)`
  @media (max-width: 768px) {
    display: inline-flex;
  }
`;

const MobileProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const MobileProfileName = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
`;

const MobileProfileTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const MobileProfileSub = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const MobileMenuSection = styled.div`
  display: grid;
  gap: 6px;
`;

const MobileMenuDivider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.colors.border};
  margin: 6px 0;
`;

const MobileMenuFooter = styled.div`
  margin-top: auto;
  display: grid;
  gap: 8px;
`;

const MobileMenuLink = styled(Link) <{ $active?: boolean }>`
  padding: 10px 12px;
  border-radius: 10px;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.text : theme.colors.muted};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.surfaceRaised : "transparent"};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const MobileMenuButton = styled.button`
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const MenuLink = styled(Link)`
  padding: 8px 10px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const MenuButton = styled.button<{ $muted?: boolean }>`
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  opacity: ${({ $muted }) => ($muted ? 0.7 : 1)};
  cursor: ${({ $muted }) => ($muted ? "default" : "pointer")};

  &:hover {
    background: ${({ theme, $muted }) =>
      $muted ? "transparent" : theme.colors.surfaceRaised};
  }
`;

type HeaderProps = {
  menuButton?: React.ReactNode;
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
};

export default function Header({ menuButton, mobileMenuOpen, onMobileMenuClose }: HeaderProps) {
  const { user, isInitialized } = useAuthStore();
  const mounted = useIsHydrated();
  const [searchKeyword, setSearchKeyword] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useStableTranslation();
  const themeMode = useThemeStore((state) => state.mode);
  const toggleTheme = useThemeStore((state) => state.toggle);
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggle);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const profileButtonRef = useRef<HTMLButtonElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [profileMenuPos, setProfileMenuPos] = useState<{ top: number; right: number } | null>(null);
  const openContact = useContactStore((state) => state.openModal);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchKeyword.trim().length >= 2) {
      trackEvent("internal_search", { search_term: searchKeyword.trim() });
      router.push(`/?keyword=${encodeURIComponent(searchKeyword.trim())}`);
      onMobileMenuClose?.();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Node)) return;
      const isInButton = profileRef.current?.contains(event.target);
      const isInMenu = profileMenuRef.current?.contains(event.target);
      if (!isInButton && !isInMenu) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const updatePosition = () => {
      const button = profileButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      setProfileMenuPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [profileOpen]);

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
            <NavLink href="/trending" $active={pathname === "/trending"}>
              {t("header.trending")}
            </NavLink>
            <NavLink href="/me/bookmarks" $active={pathname === "/me/bookmarks"}>
              {t("header.bookmarks")}
            </NavLink>
            <NavLink href="/about" $active={pathname === "/about"}>
              {t("header.about")}
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
            onClick={() => {
              const next = language === "ko" ? "en" : "ko";
              trackEvent("language_toggle", { selected_lang: next });
              toggleLanguage();
            }}
            title={t("header.languageToggle")}
          >
            {language === "ko" ? "KR" : "EN"}
          </LangButton>
          <IconButton type="button" aria-label={t("header.notifications")}>
            <Dot />
          </IconButton>
          {user ? (
            <>
              <ProfileMenuWrap ref={profileRef}>
                <ProfileButton
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  ref={profileButtonRef}
                >
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
                </ProfileButton>
              </ProfileMenuWrap>
              {profileOpen && mounted && profileMenuPos &&
                createPortal(
                  <ProfileMenu
                    ref={profileMenuRef}
                    style={{ top: profileMenuPos.top, right: profileMenuPos.right }}
                  >
                    <MenuButton type="button" $muted>
                      {user.nickname}
                      {t("header.profileSuffix")}
                    </MenuButton>
                    <MenuLink href="/me/profile" onClick={() => setProfileOpen(false)}>
                      {t("header.profileEdit")}
                    </MenuLink>
                    <MenuButton
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        openContact();
                      }}
                    >
                      {t("support.contactButton")}
                    </MenuButton>
                    <MenuButton
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        handleLogout();
                      }}
                    >
                      {t("header.logout")}
                    </MenuButton>
                  </ProfileMenu>,
                  document.body
                )}
            </>
          ) : (
            <Button onClick={() => (window.location.href = "/login")}>
              {t("header.login")}
            </Button>
          )}
        </Actions>
      </HeaderInner>
      <MobileMenuOverlay $open={Boolean(mobileMenuOpen)} onClick={onMobileMenuClose} />
      <MobileMenuDrawer $open={Boolean(mobileMenuOpen)}>
        <MobileMenuHeader>
          <MobileProfile>
            {user?.profileImageUrl ? (
              <Avatar
                src={user.profileImageUrl}
                alt={`${user.nickname} 프로필 이미지`}
              />
            ) : (
              <AvatarFallback aria-hidden="true">
                {user?.nickname?.trim().slice(0, 1) || "U"}
              </AvatarFallback>
            )}
            <MobileProfileName>
              <MobileProfileTitle>
                {user?.nickname ?? t("header.login")}
                {user ? t("header.profileSuffix") : ""}
              </MobileProfileTitle>
              <MobileProfileSub>
                {user ? t("header.profileEdit") : t("auth.loginRequired")}
              </MobileProfileSub>
            </MobileProfileName>
          </MobileProfile>
          <MobileMenuClose
            type="button"
            aria-label={t("common.close")}
            onClick={onMobileMenuClose}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </MobileMenuClose>
        </MobileMenuHeader>
        <MobileMenuSection>
          <MobileMenuLink
            href="/"
            $active={pathname === "/"}
            onClick={onMobileMenuClose}
          >
            <Home size={16} />
          {t("header.overview")}
          </MobileMenuLink>
          <MobileMenuLink
            href="/me/subscriptions"
            $active={pathname === "/me/subscriptions"}
            onClick={onMobileMenuClose}
          >
            <Users size={16} />
          {t("header.following")}
          </MobileMenuLink>
          <MobileMenuLink
            href="/me/bookmarks"
            $active={pathname === "/me/bookmarks"}
            onClick={onMobileMenuClose}
          >
            <Bookmark size={16} />
          {t("header.bookmarks")}
          </MobileMenuLink>
          <MobileMenuLink
            href="/trending"
            $active={pathname === "/trending"}
            onClick={onMobileMenuClose}
          >
            <Flame size={16} />
          {t("header.trending")}
          </MobileMenuLink>
          <MobileMenuLink
            href="/about"
            $active={pathname === "/about"}
            onClick={onMobileMenuClose}
          >
            <Info size={16} />
            {t("header.about")}
          </MobileMenuLink>
        </MobileMenuSection>
        <MobileMenuDivider />
        <MobileMenuFooter>
          <MobileMenuButton
            type="button"
            onClick={() => {
              onMobileMenuClose?.();
              openContact();
            }}
          >
            <MessageCircle size={16} />
            {t("support.contactButton")}
          </MobileMenuButton>
        </MobileMenuFooter>
      </MobileMenuDrawer>
    </HeaderWrap>
  );
}
