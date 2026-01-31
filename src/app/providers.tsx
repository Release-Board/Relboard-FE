"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ThemeProvider } from "styled-components";
import { I18nextProvider } from "react-i18next";

import StyledComponentsRegistry from "@/lib/styled-components-registry";
import GlobalStyle from "@/styles/global-style";
import { darkTheme, lightTheme } from "@/styles/theme";
import { fetchUser, refreshAccessToken } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/authStore";
import { useThemeStore } from "@/lib/store/themeStore";
import { useLanguageStore } from "@/lib/store/languageStore";
import i18n from "@/lib/i18n";

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
  const themeMode = useThemeStore((state) => state.mode);
  const initializeTheme = useThemeStore((state) => state.initialize);
  const initializeLanguage = useLanguageStore((state) => state.initialize);

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

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  return (
    <StyledComponentsRegistry>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
          <GlobalStyle />
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ThemeProvider>
      </I18nextProvider>
    </StyledComponentsRegistry>
  );
}
