"use client";

import { useState } from "react";
import styled from "styled-components";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";
import { API_BASE_URL } from "@/lib/api/client";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  gap: 24px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const KakaoButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 48px;
  background-color: #fee500;
  color: rgba(0, 0, 0, 0.85);
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  
  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const GithubButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 300px;
  height: 48px;
  background-color: #111111;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid #27272a;

  &:hover {
    border-color: #3f3f46;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function LoginPage() {
    const { t } = useStableTranslation();
    const [redirecting, setRedirecting] = useState(false);

    const handleGithubLogin = () => {
        if (redirecting) return;
        setRedirecting(true);
        window.location.href = `${API_BASE_URL}/api/v1/auth/github/login`;
    };
    const handleLogin = () => {
        if (redirecting) return;
        setRedirecting(true);
        // Redirect to Backend OAuth endpoint which redirects to Kakao
        window.location.href = `${API_BASE_URL}/api/v1/auth/kakao/login`;
    };

    return (
        <Container>
            <Title>{t("login.title")}</Title>
            <GithubButton type="button" onClick={handleGithubLogin} disabled={redirecting}>
                {t("login.github")}
            </GithubButton>
            <KakaoButton type="button" onClick={handleLogin} disabled={redirecting}>
                {t("login.kakao")}
            </KakaoButton>
        </Container>
    );
}
