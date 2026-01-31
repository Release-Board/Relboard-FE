"use client";

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

const KakaoButton = styled.a`
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
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    opacity: 0.9;
  }
`;

export default function LoginPage() {
    const { t } = useStableTranslation();
    const handleLogin = () => {
        // Redirect to Backend OAuth endpoint which redirects to Kakao
        window.location.href = `${API_BASE_URL}/api/v1/auth/kakao/login`;
    };

    return (
        <Container>
            <Title>{t("login.title")}</Title>
            <KakaoButton onClick={handleLogin}>
                {t("login.kakao")}
            </KakaoButton>
        </Container>
    );
}
