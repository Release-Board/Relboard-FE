import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useIsHydrated } from "@/lib/hooks/useIsHydrated";

export function useStableTranslation() {
  const { t, i18n: i18nInstance } = useTranslation();
  const hydrated = useIsHydrated();

  const stableT = hydrated ? t : i18n.getFixedT("en");
  const language = hydrated ? i18nInstance.language : "en";

  return { t: stableT, i18n: i18nInstance, language, ready: hydrated };
}
