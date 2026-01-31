export const theme = {
  colors: {
    // Background Colors
    background: "#000000",      // Pure Black (메인 배경)
    surface: "#0a0a0a",         // 카드/패널 배경
    surfaceRaised: "#1a1a1a",   // Hover, Active 상태 배경
    elevated: "#222222",        // 모달, 드롭다운 배경

    // Text Colors
    text: "#ffffff",            // 메인 텍스트
    textSecondary: "#a1a1aa",   // 서브 텍스트, 설명
    muted: "#71717a",           // 더 연한 보조 텍스트

    // Accent Colors (Green)
    accent: "#10b981",          // Primary Green
    accentStrong: "#059669",    // Accent Hover

    // Border & Divider
    border: "#27272a",          // 카드 테두리, 구분선
    borderHover: "#3f3f46",     // Hover 시 테두리

    // Tags & Badges
    tagBg: "#27272a",
    tagText: "#d4d4d8",
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
