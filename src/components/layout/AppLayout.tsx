"use client";

import { Suspense, useState } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import TechStackSidebar from "@/features/tech-stacks/components/TechStackSidebar";
import Header from "./Header";
import { useAuthStore } from "@/lib/store/authStore";
import ToastHost from "@/components/common/ToastHost";
import ContactModal from "@/components/support/ContactModal";

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
`;

const HeaderWrap = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

const CenteredContainer = styled.div`
  display: flex;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing[6]};
  flex: 1;

  @media (max-width: ${BREAKPOINTS.tablet}) {
    padding: 0 ${({ theme }) => theme.spacing[4]};
  }
`;

const SidebarWrap = styled.aside<{ $isOpen?: boolean }>`
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;

  @media (max-width: ${BREAKPOINTS.tablet}) {
    position: fixed;
    top: 64px;
    left: 0;
    z-index: 99;
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
    top: 64px;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 98;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
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
  const { t } = useStableTranslation();

  return (
    <LayoutWrap>
      <HeaderWrap>
        <Header
          menuButton={
            <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)} aria-label={t("menu.open")}>
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
          <Content>{isInitialized ? children : <InitPlaceholder />}</Content>
        </Main>
      </CenteredContainer>
      <ToastHost />
      <ContactModal />
    </LayoutWrap>
  );
}
