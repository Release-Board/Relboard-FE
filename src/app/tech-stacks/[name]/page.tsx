"use client";

import styled from "styled-components";

import TechStackTimeline from "@/features/tech-stacks/components/TechStackTimeline";

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
  gap: 36px;
`;

type Props = {
  params: { name: string };
};

export default function TechStackPage({ params }: Props) {
  return (
    <Page>
      <Container>
        <TechStackTimeline techStackName={params.name} />
      </Container>
    </Page>
  );
}
