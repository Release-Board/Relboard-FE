import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

export function useStableTranslation() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const stableT = hydrated ? t : i18n.getFixedT("en");
  const language = hydrated ? i18nInstance.language : "en";

  return { t: stableT, i18n: i18nInstance, language, ready: hydrated };
}
