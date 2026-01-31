import i18n from "@/lib/i18n";

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return i18n.t("time.justNow");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return i18n.t("time.minutes", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t("time.hours", { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return i18n.t("time.days", { count: days });
  return new Intl.DateTimeFormat(i18n.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
