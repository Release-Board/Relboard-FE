"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";

import StyledComponentsRegistry from "@/lib/styled-components-registry";
import GlobalStyle from "@/styles/global-style";
import { theme } from "@/styles/theme";
import { fetchUser, refreshAccessToken } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
          },
        },
      })
  );
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    let active = true;
    const initAuth = async () => {
      try {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken && active) {
          setAccessToken(newAccessToken);
          const user = await fetchUser();
          if (active) {
            setUser(user);
          }
        }
      } catch (error) {
        // Ignore init failures; user stays logged out.
      } finally {
        if (active) {
          setInitialized(true);
        }
      }
    };

    initAuth();
    return () => {
      active = false;
    };
  }, [setAccessToken, setInitialized, setUser]);

  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
