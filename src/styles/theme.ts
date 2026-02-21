export const darkTheme = {
  colors: {
    background: "#070b14",
    surface: "#0d1321",
    surfaceRaised: "#111a2a",
    elevated: "#141f33",
    text: "#e5e7eb",
    textSecondary: "#a6b0c3",
    muted: "#76839b",
    accent: "#4f8cff",
    accentStrong: "#6da2ff",
    border: "#233047",
    borderHover: "#33476b",
    tagBg: "#1b2a43",
    tagText: "#d8e4ff",
    badgeBreakingBg: "#dc2626",
    badgeBreakingText: "#ffffff",
  },
  fonts: {
    body: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "var(--font-geist-mono)",
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "24px",
    xxl: "32px",
  },
  radii: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    pill: "9999px",
  },
  shadows: {
    soft: "0 16px 40px rgba(0, 0, 0, 0.45)",
    medium: "0 20px 48px rgba(0, 0, 0, 0.55)",
  },
  spacing: {
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    8: "32px",
  },
  semantic: {
    breaking: "#dc2626",
    security: "#f59e0b",
    feature: "#3b82f6",
    fix: "#10b981",
  },
};

export const lightTheme = {
  ...darkTheme,
  colors: {
    ...darkTheme.colors,
    background: "#ffffff",
    surface: "#f8f8f8",
    surfaceRaised: "#f1f5f9",
    elevated: "#ffffff",
    text: "#0a0a0a",
    textSecondary: "#52525b",
    muted: "#71717a",
    border: "#e4e4e7",
    borderHover: "#d4d4d8",
    tagBg: "#e4e4e7",
    tagText: "#3f3f46",
  },
  shadows: {
    soft: "0 12px 28px rgba(15, 23, 42, 0.12)",
    medium: "0 16px 36px rgba(15, 23, 42, 0.16)",
  },
};

export const theme = darkTheme;
