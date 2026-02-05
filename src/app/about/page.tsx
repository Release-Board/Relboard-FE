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
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: calc(100vh - 64px);
  padding: 64px 0 120px;
  position: relative;
  overflow: hidden;
`;

const Container = styled.div`
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 12px;
  }
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
  gap: 32px;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: center;

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: stretch;
  }
`;

const Glow = styled.div`
  position: absolute;
  inset: -15% 10% 15% 10%;
  background: radial-gradient(
    circle,
    rgba(16, 185, 129, 0.24) 0%,
    rgba(16, 185, 129, 0.1) 35%,
    rgba(16, 185, 129, 0) 70%
  );
  filter: blur(10px);
  z-index: 0;
  opacity: 0.7;
`;

const GridBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.2;
  pointer-events: none;
`;

const HeroContent = styled.div`
  grid-column: span 7;
  display: grid;
  gap: 18px;
  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    grid-column: span 12;
  }
`;

const HeroVisual = styled.div`
  grid-column: span 5;
  display: grid;
  gap: 12px;
  position: relative;
  z-index: 1;
  min-width: 0;
  max-width: 100%;

  @media (max-width: 900px) {
    grid-column: span 12;
    width: 100%;
  }
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
  color: ${({ theme }) => theme.colors.muted};
  max-width: 620px;
  margin: 0;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const Highlight = styled.span`
  color: ${({ theme }) => theme.colors.accentStrong};
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const Text = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0;
  line-height: 1.6;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text};
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
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 16px;
  display: grid;
  gap: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const CardText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
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
  background: ${({ theme }) => theme.colors.accentStrong};
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  font-size: 14px;
`;

const VisualCard = styled.div`
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 18px;
  display: grid;
  gap: 10px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
`;

const VisualTitle = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const VisualRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const VisualDot = styled.span<{ $color?: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color, theme }) => $color ?? theme.colors.accent};
`;

const VisualText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

export default function AboutPage() {
  const { t } = useStableTranslation();

  return (
    <Page>
      <GridBackdrop aria-hidden="true" />
      <Container>
        <Hero $delay="0.05s">
          <Glow aria-hidden="true" />
          <HeroContent>
            <Title>
              {t("about.heroTitle")}
              <br />
              <Highlight>{t("about.heroHighlight")}</Highlight>
            </Title>
            <Subtitle>{t("about.heroSubtitle")}</Subtitle>
            <ChipRow>
              <Chip>AI Translation</Chip>
              <Chip>Personalized Feed</Chip>
              <Chip>Trending Signals</Chip>
            </ChipRow>
          </HeroContent>
          <HeroVisual>
            <VisualCard>
              <VisualTitle>Release signal</VisualTitle>
              <VisualRow>
                <VisualDot $color="#10b981" />
                <VisualText>Breaking updates · Faster triage</VisualText>
              </VisualRow>
              <VisualRow>
                <VisualDot />
                <VisualText>Highlights ready in Korean</VisualText>
              </VisualRow>
            </VisualCard>
            <VisualCard>
              <VisualTitle>Focused tracking</VisualTitle>
              <VisualRow>
                <VisualDot $color="#f59e0b" />
                <VisualText>Follow only what matters</VisualText>
              </VisualRow>
              <VisualRow>
                <VisualDot $color="#3b82f6" />
                <VisualText>Organized by stack & version</VisualText>
              </VisualRow>
            </VisualCard>
          </HeroVisual>
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
