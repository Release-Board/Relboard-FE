"use client";

import { Suspense, useEffect, useState } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import TechStackSidebar from "@/features/tech-stacks/components/TechStackSidebar";
import Header from "./Header";
import { useAuthStore } from "@/lib/store/authStore";
import ToastHost from "@/components/common/ToastHost";
import ContactModal from "@/components/support/ContactModal";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useContactStore } from "@/lib/store/contactStore";
import { usePathname, useRouter } from "next/navigation";

// Breakpoints
const BREAKPOINTS = {
  mobile: "768px",
  tablet: "1024px",
};

const LayoutWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  overflow-x: hidden;
`;

const HeaderWrap = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
`;

const CenteredContainer = styled.div`
  display: flex;
  align-items: stretch;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  flex: 1;
  position: relative;

  @media (max-width: ${BREAKPOINTS.tablet}) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

const SidebarWrap = styled.aside<{ $isOpen?: boolean }>`
  width: 240px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.colors.background};
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;

  @media (max-width: ${BREAKPOINTS.tablet}) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 200;
    height: 100vh;
    transform: ${({ $isOpen }) => ($isOpen ? "translateX(0)" : "translateX(-100%)")};
    transition: transform 200ms ease;
    box-shadow: ${({ $isOpen }) => ($isOpen ? "4px 0 20px rgba(0,0,0,0.5)" : "none")};
  }

  @media (max-width: ${BREAKPOINTS.mobile}) {
    width: 280px;
  }
`;

const Overlay = styled.div<{ $isOpen?: boolean }>`
  display: none;

  @media (max-width: ${BREAKPOINTS.tablet}) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 1px;
    background: ${({ theme }) => theme.colors.border};
  }

  @media (max-width: ${BREAKPOINTS.tablet}) {
    &::before {
      display: none;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 32px 36px;
  max-width: 900px;
  width: 100%;

  @media (max-width: ${BREAKPOINTS.mobile}) {
    padding: 20px 16px;
  }
`;

const BackRow = styled.div`
  margin-bottom: 16px;
`;

const BackButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const FloatingSupportButton = styled.button`
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: none;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  cursor: pointer;
  z-index: 900;

  @media (min-width: ${BREAKPOINTS.tablet}) {
    display: inline-flex;
  }
`;

const InitPlaceholder = styled.div`
  height: 40vh;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const MenuButton = styled.button`
  display: none;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  padding: 8px;
  cursor: pointer;

  @media (max-width: ${BREAKPOINTS.tablet}) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useStableTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const openContact = useContactStore((state) => state.openModal);

  const showBackButton =
    pathname.startsWith("/releases/") || pathname === "/me/profile";

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile})`);
    const handleChange = (matches: boolean) => {
      setIsMobile(matches);
      if (matches) {
        setSidebarOpen(false);
      } else {
        setMobileMenuOpen(false);
      }
    };

    handleChange(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => handleChange(event.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileMenuOpen((prev) => !prev);
      return;
    }
    setSidebarOpen((prev) => !prev);
  };

  return (
    <LayoutWrap>
      <HeaderWrap>
        <Header
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuClose={() => setMobileMenuOpen(false)}
          menuButton={
            <MenuButton onClick={handleMenuClick} aria-label={t("menu.open")}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </MenuButton>
          }
        />
      </HeaderWrap>
      <CenteredContainer>
        <Overlay $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
        <SidebarWrap $isOpen={sidebarOpen}>
          <Suspense fallback={null}>
            <TechStackSidebar />
          </Suspense>
        </SidebarWrap>
        <Main>
          <Content>
            {showBackButton && (
              <BackRow>
                <BackButton type="button" onClick={() => router.back()}>
                  <ArrowLeft size={14} />
                  {t("header.back")}
                </BackButton>
              </BackRow>
            )}
            {isInitialized ? children : <InitPlaceholder />}
          </Content>
        </Main>
      </CenteredContainer>
      <ToastHost />
      <ContactModal />
      <FloatingSupportButton type="button" onClick={openContact}>
        <MessageCircle size={16} />
        {t("support.contactButton")}
      </FloatingSupportButton>
    </LayoutWrap>
  );
}
