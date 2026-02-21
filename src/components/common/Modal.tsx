"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { useIsHydrated } from "@/lib/hooks/useIsHydrated";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
`;

const Card = styled.div<{ $size: "sm" | "md" | "lg" }>`
  width: min(
    ${({ $size }) => ($size === "sm" ? "360px" : $size === "lg" ? "560px" : "420px")},
    100%
  );
  max-height: 80vh;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  padding: 24px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
`;

const Title = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const BodyText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.6;
`;

const Content = styled.div`
  display: grid;
  gap: 12px;
  overflow-y: auto;
  padding-right: 6px;
  min-height: 0;
`;

const Actions = styled.div<{ $align: "start" | "center" | "end" }>`
  display: flex;
  justify-content: ${({ $align }) =>
    $align === "start" ? "flex-start" : $align === "center" ? "center" : "flex-end"};
  gap: 8px;
`;

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  actions?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  actionsAlign?: "start" | "center" | "end";
  children?: React.ReactNode;
};

export default function Modal({
  open,
  title,
  description,
  onClose,
  actions,
  size = "md",
  actionsAlign = "end",
  children,
}: Props) {
  const mounted = useIsHydrated();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const modal = (
    <Overlay
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Card $size={size}>
        <Title id="modal-title">{title}</Title>
        <Content>
          {description && <BodyText>{description}</BodyText>}
          {children}
        </Content>
        {actions && <Actions $align={actionsAlign}>{actions}</Actions>}
      </Card>
    </Overlay>
  );

  return createPortal(modal, document.body);
}
