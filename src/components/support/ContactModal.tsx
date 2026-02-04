"use client";

import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Modal from "@/components/common/Modal";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { useAuthStore } from "@/lib/store/authStore";
import { useContactStore } from "@/lib/store/contactStore";
import { useToast } from "@/lib/hooks/useToast";
import { submitSupportFeedback } from "@/lib/api/relboard";

const Form = styled.form`
  display: grid;
  gap: 12px;
`;

const Field = styled.label`
  display: grid;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.select`
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 10px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`;

const Input = styled.input`
  width: 100%;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 10px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  resize: vertical;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 10px 12px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.surface};
`;

const Helper = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button<{ $variant?: "primary" | "ghost" }>`
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 8px 14px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  cursor: pointer;
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === "primary" ? theme.colors.accentStrong : theme.colors.border};
  background: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.accentStrong : "transparent"};
  color: ${({ theme, $variant }) =>
    $variant === "primary" ? "#ffffff" : theme.colors.text};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const CATEGORY_OPTIONS = [
  { value: "SUGGESTION", labelKey: "support.categorySuggestion" },
  { value: "TECH_STACK_REQUEST", labelKey: "support.categoryTechStack" },
  { value: "BUG_REPORT", labelKey: "support.categoryBug" },
];

export default function ContactModal() {
  const { open, closeModal } = useContactStore();
  const { user } = useAuthStore();
  const { t } = useStableTranslation();
  const toast = useToast();

  const [category, setCategory] = useState(CATEGORY_OPTIONS[0].value);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setCategory(CATEGORY_OPTIONS[0].value);
    if (!user?.email) {
      setEmail("");
    }
  }, [open, user?.email]);

  const requiresEmail = !user?.email;
  const isEmailValid = useMemo(() => {
    if (!requiresEmail) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email, requiresEmail]);

  const canSubmit = message.trim().length >= 10 && isEmailValid;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const replyEmail = user?.email ?? (email.trim() || undefined);
      await submitSupportFeedback({
        category,
        content: message.trim(),
        email: replyEmail,
        userId: user?.id,
      });
      toast(t("support.success"), { tone: "success" });
      closeModal();
    } catch (error) {
      toast(t("support.error"), { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={t("support.title")}
      description={t("support.subtitle")}
      onClose={closeModal}
      actions={null}
      size="md"
    >
      <Form onSubmit={handleSubmit}>
        <Field>
          {t("support.category")}
          <Select value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>
        <Field>
          {t("support.message")}
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t("support.messagePlaceholder")}
          />
          <Helper>{t("support.messageHelper")}</Helper>
        </Field>
        {requiresEmail && (
          <Field>
            {t("support.replyEmail")}
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("support.emailPlaceholder")}
            />
            {!isEmailValid && (
              <Helper>{t("support.emailInvalid")}</Helper>
            )}
          </Field>
        )}
        <Footer>
          <Button type="button" onClick={closeModal}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" $variant="primary" disabled={!canSubmit || submitting}>
            {submitting ? t("support.submitting") : t("support.submit")}
          </Button>
        </Footer>
      </Form>
    </Modal>
  );
}
