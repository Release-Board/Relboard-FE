"use client";

import styled from "styled-components";

import ReleaseTimeline from "@/features/releases/components/ReleaseTimeline";

const Hero = styled.section`
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
`;

const Headline = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.6;
`;

export default function Home() {
  return (
    <>
      <Hero>
        <Headline>Release Notes</Headline>
        <Sub>Track the latest updates from your favorite tech stacks in one place.</Sub>
      </Hero>

      <ReleaseTimeline />
    </>
  );
}
