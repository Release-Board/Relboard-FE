"use client";

import styled from "styled-components";
import TrendingSection from "@/features/releases/components/TrendingSection";

const Section = styled.section`
  display: grid;
  gap: 16px;
`;

export default function TrendingPage() {
  return (
    <Section>
      <TrendingSection />
    </Section>
  );
}
