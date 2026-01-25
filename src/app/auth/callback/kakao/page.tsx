"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styled from "styled-components";
import { useAuthStore } from "@/lib/store/authStore";
import { loginWithKakaoCode, fetchUser } from "@/lib/api/client";

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 100px;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.muted};
`;

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const processed = useRef(false);
    const { login } = useAuthStore();

    useEffect(() => {
        if (!code || processed.current) return;
        processed.current = true;

        async function processLogin() {
            try {
                // 1. Exchange Code for Token (via BFF)
                const { accessToken } = await loginWithKakaoCode(code!);

                // 2. Set AccessToken to Store (but we need user info too)
                // Store needs user object. 
                // We set token first to allow fetchUser to use it.
                // Wait, store.login takes (user, token).
                // So we can't set token alone easily unless we add setToken to store.
                // But let's hack it: temporarily set token or assume fetchUser works if we pass token?
                // fetchJson injects token from store.
                // So we must put it in store.

                // Let's modify store or use a temporary way.
                // Actually, we can just call fetchUser with the token manually?
                // But fetchUser uses fetchJson which uses store.
                // So we should update store.

                // Let's assume we update fetchUser to accept token optionally?
                // Or just update store with dummy user first.

                // Better: Update store to allow partial login?
                // Or just `useAuthStore.setState({ accessToken })` directly (Zustand allows direct access if outside hook, but here we are in hook)
                useAuthStore.setState({ accessToken });

                // 3. Fetch User Info
                const user = await fetchUser();

                // 4. Final Login
                login(user, accessToken);

                router.replace("/");
            } catch (error) {
                console.error("Login failed", error);
                alert("로그인에 실패했습니다.");
                router.replace("/login");
            }
        }

        processLogin();
    }, [code, router, login]);

    return <Container>로그인 중입니다...</Container>;
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<Container>로딩중...</Container>}>
            <CallbackContent />
        </Suspense>
    );
}
