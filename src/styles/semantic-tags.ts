import type { TagType } from "@/lib/api/types";

type TagStyle = {
  color: string;
  background: string;
  boxShadow: string;
};

export function getTagStyle(tag: TagType | "ALL") {
  switch (tag) {
    case "BREAKING":
      return {
        color: "#ff4d4f",
        background: "rgba(255, 77, 79, 0.12)",
        boxShadow: "0 0 8px rgba(255, 77, 79, 0.4)",
      };
    case "SECURITY":
      return {
        color: "#ff9f1c",
        background: "rgba(255, 159, 28, 0.14)",
        boxShadow: "0 0 8px rgba(255, 159, 28, 0.4)",
      };
    case "FEATURE":
      return {
        color: "#2f6bff",
        background: "rgba(47, 107, 255, 0.12)",
        boxShadow: "none",
      };
    case "FIX":
      return {
        color: "#12b886",
        background: "rgba(18, 184, 134, 0.12)",
        boxShadow: "none",
      };
    default:
      return {
        color: "#0f1a3a",
        background: "rgba(15, 26, 58, 0.06)",
        boxShadow: "none",
      };
  }
}

export function getTagStyleByTagType(tag: TagType) {
  return getTagStyle(tag);
}
