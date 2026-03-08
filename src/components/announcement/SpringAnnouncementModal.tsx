"use client";

import { useState } from "react";
import styled from "styled-components";
import { useRouter, usePathname } from "next/navigation";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import Modal from "@/components/common/Modal";

const STORAGE_KEY = "relboard-announcement-spring-all-projects-v1-dismissed";

const ModalBody = styled.div`
  display: grid;
  gap: 14px;
`;

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid rgba(47, 107, 255, 0.35);
  background: linear-gradient(
    140deg,
    rgba(47, 107, 255, 0.2) 0%,
    rgba(16, 185, 129, 0.14) 48%,
    rgba(13, 19, 33, 0.95) 100%
  );
  padding: 14px;
`;

const HeroBackdrop = styled.div`
  position: absolute;
  top: -48px;
  right: -52px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.32) 0%,
    rgba(255, 255, 255, 0) 68%
  );
  pointer-events: none;
`;

const HeroInner = styled.div`
  position: relative;
  display: grid;
  gap: 10px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: 5px 10px;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.04em;
  background: linear-gradient(
    120deg,
    rgba(16, 185, 129, 0.95) 0%,
    rgba(47, 107, 255, 0.95) 100%
  );
`;

const HeroTitle = styled.h5`
  margin: 0;
  font-size: clamp(17px, 2vw, 20px);
  line-height: 1.35;
  color: #ffffff;
`;

const HeroText = styled.p`
  margin: 0;
  color: rgba(229, 231, 235, 0.92);
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.55;
`;

const PointList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
`;

const PointItem = styled.li`
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  padding: 10px 11px;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: 1.45;
  display: grid;
  grid-template-columns: 20px 1fr;
  gap: 8px;
  align-items: start;
`;

const Check = styled.span`
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.18);
  border: 1px solid rgba(16, 185, 129, 0.45);
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 6px;
    top: 3px;
    width: 5px;
    height: 9px;
    border: solid rgba(16, 185, 129, 0.95);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
`;

const Footer = styled.div`
  display: grid;
  gap: 10px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 10px;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.muted};
`;

const Checkbox = styled.input`
  width: 14px;
  height: 14px;
`;

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const GhostButton = styled.button`
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  padding: 9px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceRaised};
  }
`;

const PrimaryButton = styled.button`
  border: 1px solid rgba(47, 107, 255, 0.85);
  background: linear-gradient(
    120deg,
    rgba(47, 107, 255, 0.95) 0%,
    rgba(16, 185, 129, 0.88) 100%
  );
  color: #ffffff;
  padding: 9px 14px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;

  &:hover {
    filter: brightness(1.05);
  }

  &::after {
    content: "↗";
    font-size: 13px;
  }
`;

function readDismissed() {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function persistDismissed() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Ignore storage access errors.
  }
}

export default function SpringAnnouncementModal() {
  const { t } = useStableTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(() => !readDismissed());
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const visible = open && !pathname.startsWith("/auth/callback");

  const closeModal = () => {
    if (dontShowAgain) {
      persistDismissed();
    }
    setOpen(false);
  };

  const moveToSpring = () => {
    if (dontShowAgain) {
      persistDismissed();
    }
    setOpen(false);
    router.push("/?keyword=Spring");
  };

  return (
    <Modal
      open={visible}
      title={t("announcement.springAllProjects.modalTitle")}
      description={undefined}
      onClose={closeModal}
      size="lg"
      actions={null}
    >
      <ModalBody>
        <Hero>
          <HeroBackdrop aria-hidden="true" />
          <HeroInner>
            <Badge>{t("announcement.springAllProjects.badge")}</Badge>
            <HeroTitle>{t("announcement.springAllProjects.cardTitle")}</HeroTitle>
            <HeroText>{t("announcement.springAllProjects.modalSubtitle")}</HeroText>
            <HeroText>{t("announcement.springAllProjects.cardBody")}</HeroText>
          </HeroInner>
        </Hero>

        <PointList>
          <PointItem>
            <Check aria-hidden="true" />
            <span>{t("announcement.springAllProjects.point1")}</span>
          </PointItem>
          <PointItem>
            <Check aria-hidden="true" />
            <span>{t("announcement.springAllProjects.point2")}</span>
          </PointItem>
          <PointItem>
            <Check aria-hidden="true" />
            <span>{t("announcement.springAllProjects.point3")}</span>
          </PointItem>
        </PointList>

        <Footer>
          <CheckboxLabel>
            <Checkbox
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
            />
            {t("announcement.springAllProjects.dontShowAgain")}
          </CheckboxLabel>

          <ActionRow>
            <GhostButton type="button" onClick={closeModal}>
              {t("announcement.springAllProjects.close")}
            </GhostButton>
            <PrimaryButton type="button" onClick={moveToSpring}>
              {t("announcement.springAllProjects.viewSpring")}
            </PrimaryButton>
          </ActionRow>
        </Footer>
      </ModalBody>
    </Modal>
  );
}
