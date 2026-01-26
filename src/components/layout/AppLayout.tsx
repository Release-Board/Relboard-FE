"use client";

import styled from "styled-components";
import TechStackSidebar from "@/features/tech-stacks/components/TechStackSidebar";
import Header from "./Header";
import { useAuthStore } from "@/lib/store/authStore";

const LayoutWrap = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 40px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const InitPlaceholder = styled.div`
  height: 40vh;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const SidebarWrap = styled.aside`
  width: 260px;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
`;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return (
    <LayoutWrap>
      <SidebarWrap>
        <TechStackSidebar />
      </SidebarWrap>
      <Main>
        <Header />
        <Content>{isInitialized ? children : <InitPlaceholder />}</Content>
      </Main>
    </LayoutWrap>
  );
}
