"use client";

import styled, { keyframes } from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { useToastStore } from "@/lib/store/toastStore";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: grid;
  gap: 10px;
  z-index: 9999;
`;

const Toast = styled.div<{ $tone: "success" | "error" | "info" }>`
  min-width: 220px;
  max-width: 320px;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid
    ${({ theme, $tone }) =>
      $tone === "error"
        ? "rgba(232, 87, 87, 0.5)"
        : $tone === "success"
          ? "rgba(47, 107, 255, 0.35)"
          : theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: ${({ theme }) => theme.shadows.soft};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  animation: ${fadeIn} 160ms ease;
  line-height: 1.4;
`;

const ToneLabel = styled.span<{ $tone: "success" | "error" | "info" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: ${({ theme, $tone }) =>
    $tone === "error"
      ? "#e85757"
      : $tone === "success"
        ? theme.colors.accentStrong
        : theme.colors.muted};
`;

export default function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  const { t } = useStableTranslation();

  if (toasts.length === 0) return null;

  return (
    <Container aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} $tone={toast.tone}>
          <ToneLabel $tone={toast.tone}>
            {toast.tone === "success"
              ? t("toast.success")
              : toast.tone === "error"
                ? t("toast.error")
                : t("toast.info")}
          </ToneLabel>
          {" "}
          {toast.message}
        </Toast>
      ))}
    </Container>
  );
}
