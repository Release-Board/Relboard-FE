"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

import type { TechStackResponse } from "@/lib/api/types";
import { useAuthStore } from "@/lib/store/authStore";
import { useSubscriptions } from "../hooks/useSubscriptions";
import Modal from "@/components/common/Modal";

const Button = styled.button<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 8px 12px;
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

const Icon = styled.svg<{ $active: boolean }>`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  fill: ${({ $active, theme }) =>
    $active ? "#ffffff" : "transparent"};
  stroke: ${({ $active, theme }) =>
    $active ? "#ffffff" : theme.colors.accentStrong};
  stroke-width: 1.6;
`;

const SecondaryButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const DangerButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.accentStrong};
  background: ${({ theme }) => theme.colors.accentStrong};
  color: #ffffff;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  transition: all 160ms ease;

  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    border-color: ${({ theme }) => theme.colors.accent};
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClick = () => {
    if (!user || !accessToken) {
      router.push("/login");
      return;
    }
    if (subscribed) {
      setConfirmOpen(true);
      return;
    }
    subscribe.mutate(techStack);
  };

  const handleConfirmUnsubscribe = () => {
    setConfirmOpen(false);
    unsubscribe.mutate(techStack);
  };

  return (
    <>
      <Button
        type="button"
        $active={subscribed}
        onClick={handleClick}
        disabled={isPending}
        aria-label={subscribed ? "구독 해제" : "구독"}
        title={subscribed ? "구독중" : "구독"}
      >
        <Icon $active={subscribed} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3.6l2.5 5.05 5.58.81-4.04 3.94.95 5.55L12 16.9l-4.99 2.62.95-5.55-4.04-3.94 5.58-.81L12 3.6z" />
        </Icon>
        {subscribed ? "구독중" : "구독"}
      </Button>

      <Modal
        open={confirmOpen}
        title="구독을 취소하시겠습니까?"
        description="구독을 해제하면 해당 스택의 업데이트를 놓칠 수 있어요."
        onClose={() => setConfirmOpen(false)}
        actions={
          <>
            <SecondaryButton type="button" onClick={() => setConfirmOpen(false)}>
              취소
            </SecondaryButton>
            <DangerButton type="button" onClick={handleConfirmUnsubscribe}>
              구독 취소
            </DangerButton>
          </>
        }
      />
    </>
  );
}
