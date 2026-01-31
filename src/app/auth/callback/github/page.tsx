"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { useAuthStore } from "@/lib/store/authStore";
import { fetchUser } from "@/lib/api/client";
import { useStableTranslation } from "@/lib/hooks/useStableTranslation";

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 100px;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.muted};
`;

function CallbackContent() {
    const router = useRouter();
    const processed = useRef(false);
    const { login } = useAuthStore();
    const { t } = useStableTranslation();

    useEffect(() => {
        if (processed.current) return;
        processed.current = true;

        async function processLogin() {
            try {
                const getCookie = (name: string) => {
                    const value = `; ${document.cookie}`;
                    const parts = value.split(`; ${name}=`);
                    if (parts.length === 2) return parts.pop()?.split(";").shift();
                };
                const accessToken = getCookie("accessToken");

                if (!accessToken) {
                    throw new Error("No token provided in cookie");
                }

                document.cookie = "accessToken=; path=/; max-age=0";

                useAuthStore.setState({ accessToken });
                const user = await fetchUser();

                login(user, accessToken);
                router.replace("/");
            } catch (error) {
                console.error("Login processing failed", error);
                router.replace("/login");
            }
        }
        processLogin();
    }, [router, login]);

    return <Container>{t("auth.loggingIn")}</Container>;
}

export default function AuthCallbackPage() {
    const { t } = useStableTranslation();
    return (
        <Suspense fallback={<Container>{t("auth.loading")}</Container>}>
            <CallbackContent />
        </Suspense>
    );
}
