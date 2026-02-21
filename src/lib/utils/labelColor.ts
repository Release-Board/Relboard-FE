type ReadableLabelStyle = {
  bg: string;
  fg: string;
  border: string;
};

function toHexColor(input?: string | null) {
  if (!input) return undefined;
  return input.startsWith("#") ? input : `#${input}`;
}

export function getReadableLabelStyle(input?: string | null): ReadableLabelStyle {
  const bg = toHexColor(input) ?? "#4b5563";
  const hex = bg.replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;

  if (normalized.length !== 6) {
    return {
      bg,
      fg: "#ffffff",
      border: "rgba(255,255,255,0.22)",
    };
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const isLight = luminance > 0.6;

  return {
    bg,
    fg: isLight ? "#111827" : "#ffffff",
    border: isLight ? "rgba(17,24,39,0.28)" : "rgba(255,255,255,0.22)",
  };
}
