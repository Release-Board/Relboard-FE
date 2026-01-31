"use client";

import Link from "next/link";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

import SubscribeButton from "@/features/subscriptions/components/SubscribeButton";
import { useSubscriptions } from "@/features/subscriptions/hooks/useSubscriptions";
import { useAuthStore } from "@/lib/store/authStore";

const Section = styled.section`
  display: grid;
  gap: 20px;
`;

const Heading = styled.div`
  display: grid;
  gap: 6px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
`;

const Sub = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const StateMessage = styled.div`
  padding: 24px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const List = styled.div`
  display: grid;
  gap: 16px;
`;

const Card = styled.div`
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const StackInfo = styled.div`
  display: grid;
  gap: 6px;
`;

const StackName = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const StackMeta = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const LoginLink = styled(Link)`
  color: ${({ theme }) => theme.colors.accentStrong};
  font-weight: 600;
  text-decoration: none;
`;

export default function MySubscriptionsPage() {
  const { user } = useAuthStore();
  const { subscriptions, isLoading } = useSubscriptions();
  const { t } = useStableTranslation();

  if (!user) {
    return (
      <Section>
        <Heading>
          <Title>{t("subscriptions.title")}</Title>
          <Sub>{t("subscriptions.subtitle")}</Sub>
        </Heading>
        <StateMessage>
          {t("subscriptions.loginPrompt")}{" "}
          <LoginLink href="/login">{t("subscriptions.loginLink")}</LoginLink>
        </StateMessage>
      </Section>
    );
  }

  return (
    <Section>
      <Heading>
        <Title>{t("subscriptions.title")}</Title>
        <Sub>{t("subscriptions.subtitle")}</Sub>
      </Heading>

      {isLoading && <StateMessage>{t("subscriptions.loading")}</StateMessage>}

      {!isLoading && subscriptions.length === 0 && (
        <StateMessage>{t("subscriptions.empty")}</StateMessage>
      )}

      <List>
        {subscriptions.map((stack) => (
          <Card key={stack.id}>
            <StackInfo>
              <StackName href={`/tech-stacks/${stack.name}`}>
                {stack.name}
              </StackName>
              <StackMeta>
                {t("subscriptions.latestVersion", {
                  version: stack.latestVersion,
                  category: stack.category,
                })}
              </StackMeta>
            </StackInfo>
            <SubscribeButton techStack={stack} />
          </Card>
        ))}
      </List>
    </Section>
  );
}
