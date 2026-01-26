"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";

import type { TechStackResponse } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/authStore";
import { useSubscriptions } from "../hooks/useSubscriptions";

const Button = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 8px 14px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.accentStrong : theme.colors.border};
  color: ${({ theme, $active }) =>
    $active ? "#ffffff" : theme.colors.accentStrong};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accentStrong : theme.colors.surface};
  transition: all 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme, $active }) =>
      $active ? theme.colors.accent : theme.colors.surfaceRaised};
    color: ${({ theme, $active }) => ($active ? "#ffffff" : theme.colors.accent)};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

type Props = {
  techStack: TechStackResponse;
};

export default function SubscribeButton({ techStack }: Props) {
  const router = useRouter();
  const { user, accessToken } = useAuthStore();
  const { isSubscribed, subscribe, unsubscribe } = useSubscriptions();
  const subscribed = isSubscribed(techStack.id);
  const isPending = subscribe.isPending || unsubscribe.isPending;

  const handleClick = () => {
    if (!user || !accessToken) {
      router.push("/login");
      return;
    }
    if (subscribed) {
      unsubscribe.mutate(techStack);
      return;
    }
    subscribe.mutate(techStack);
  };

  return (
    <Button type="button" $active={subscribed} onClick={handleClick} disabled={isPending}>
      {subscribed ? "구독중" : "구독"}
    </Button>
  );
}
