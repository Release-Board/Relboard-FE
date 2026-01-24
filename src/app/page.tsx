"use client";

import styled from "styled-components";

import ReleaseTimeline from "@/features/releases/components/ReleaseTimeline";

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
    <>
      <Hero>
        <Eyebrow>RelBoard</Eyebrow>
        <Headline>릴리즈를 한눈에, 리스크는 먼저</Headline>
        <Sub />
        <HeroMeta />
      </Hero>

      <ReleaseTimeline />
    </>
  );
}
