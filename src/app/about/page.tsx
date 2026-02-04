"use client";

import styled, { keyframes } from "styled-components";
import Link from "next/link";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Page = styled.div`
  background: #050505;
  color: #e5e7eb;
  min-height: calc(100vh - 64px);
  padding: 64px 0 120px;
`;

const Container = styled.div`
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
`;

const Section = styled.section<{ $delay?: string }>`
  display: grid;
  gap: 18px;
  margin-bottom: 120px;
  opacity: 0;
  animation: ${fadeUp} 0.8s ease forwards;
  animation-delay: ${({ $delay }) => $delay ?? "0s"};

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    animation: none;
  }
`;

const Hero = styled(Section)`
  position: relative;
  padding: 40px 0;
  gap: 24px;
`;

const Glow = styled.div`
  position: absolute;
  inset: -10% 20% 20% 20%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.2) 0%,
    rgba(16, 185, 129, 0.08) 35%,
    rgba(5, 5, 5, 0) 70%
  );
  filter: blur(10px);
  z-index: 0;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  line-height: 1.15;
  margin: 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #9ca3af;
  max-width: 620px;
  margin: 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Highlight = styled.span`
  color: #10b981;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin: 0;
  color: #f9fafb;
`;

const Text = styled.p`
  font-size: 16px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.6;
`;

const CardGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MiniCard = styled.div`
  border: 1px solid #1f2937;
  border-radius: 16px;
  background: #0a0a0a;
  padding: 16px;
  display: grid;
  gap: 10px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #e5e7eb;
`;

const CardText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
  line-height: 1.5;
`;

const CtaSection = styled(Section)`
  align-items: start;
`;

const CtaButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border-radius: 999px;
  background: #10b981;
  color: #0a0a0a;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
`;

export default function AboutPage() {
  const { t } = useStableTranslation();

  return (
    <Page>
      <Container>
        <Hero $delay="0.05s">
          <Glow aria-hidden="true" />
          <Title>
            {t("about.heroTitle")}
            <br />
            <Highlight>{t("about.heroHighlight")}</Highlight>
          </Title>
          <Subtitle>{t("about.heroSubtitle")}</Subtitle>
        </Hero>

        <Section $delay="0.15s">
          <SectionTitle>{t("about.problemTitle")}</SectionTitle>
          <Text>{t("about.problemBody")}</Text>
        </Section>

        <Section $delay="0.25s">
          <SectionTitle>{t("about.solutionTitle")}</SectionTitle>
          <CardGrid>
            <MiniCard>
              <CardTitle>{t("about.solutionCard1Title")}</CardTitle>
              <CardText>{t("about.solutionCard1Body")}</CardText>
            </MiniCard>
            <MiniCard>
              <CardTitle>{t("about.solutionCard2Title")}</CardTitle>
              <CardText>{t("about.solutionCard2Body")}</CardText>
            </MiniCard>
            <MiniCard>
              <CardTitle>{t("about.solutionCard3Title")}</CardTitle>
              <CardText>{t("about.solutionCard3Body")}</CardText>
            </MiniCard>
          </CardGrid>
        </Section>

        <CtaSection $delay="0.35s">
          <SectionTitle>{t("about.ctaTitle")}</SectionTitle>
          <Text>{t("about.ctaBody")}</Text>
          <CtaButton href="/login">{t("about.ctaButton")}</CtaButton>
        </CtaSection>
      </Container>
    </Page>
  );
}
