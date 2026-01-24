"use client";

import styled from "styled-components";

import ReleaseTimeline from "@/features/releases/components/ReleaseTimeline";

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
  display: grid;
  gap: 48px;
`;

const Hero = styled.section`
  display: grid;
  gap: 18px;
`;

const Eyebrow = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accent};
`;

const Headline = styled.h1`
  margin: 0;
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.1;
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  margin: 0;
  max-width: 560px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: 1.7;
`;

const HeroMeta = styled.div`
  display: none;
`;

export default function Home() {
  return (
    <Page>
      <Container>
        <Hero>
          <Eyebrow>RelBoard</Eyebrow>
          <Headline>릴리즈를 한눈에, 리스크는 먼저</Headline>
          <Sub />
          <HeroMeta />
        </Hero>

        <ReleaseTimeline />
      </Container>
    </Page>
  );
}
