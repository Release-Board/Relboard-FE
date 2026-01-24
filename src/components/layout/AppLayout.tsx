"use client";

import styled from "styled-components";
import TechStackSidebar from "@/features/tech-stacks/components/TechStackSidebar";

const Page = styled.main`
  min-height: 100vh;
  padding: 64px 24px 120px;
  background:
    radial-gradient(1200px 600px at 20% -10%, rgba(47, 107, 255, 0.16), transparent 60%),
    radial-gradient(900px 520px at 90% 12%, rgba(27, 79, 224, 0.14), transparent 55%);
`;

const Container = styled.div`
  width: min(1200px, 100%);
  margin: 0 auto;
  display: flex;
  gap: 48px;
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  gap: 48px;
  /* Ensure content doesn't overflow flex container */
  min-width: 0;
`;

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <Page>
            <Container>
                <TechStackSidebar />
                <Content>{children}</Content>
            </Container>
        </Page>
    );
}
