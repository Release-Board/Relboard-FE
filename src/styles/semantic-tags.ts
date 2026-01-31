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
        color: "#ff6b6b",
        background: "rgba(255, 107, 107, 0.16)",
        boxShadow: "0 0 8px rgba(255, 107, 107, 0.45)",
      };
    case "SECURITY":
      return {
        color: "#ffb347",
        background: "rgba(255, 179, 71, 0.18)",
        boxShadow: "0 0 8px rgba(255, 179, 71, 0.45)",
      };
    case "FEATURE":
      return {
        color: "#4f8bff",
        background: "rgba(79, 139, 255, 0.16)",
        boxShadow: "none",
      };
    case "FIX":
      return {
        color: "#2ec4b6",
        background: "rgba(46, 196, 182, 0.16)",
        boxShadow: "none",
      };
    default:
      return {
        color: "#cbd5e1",
        background: "rgba(255, 255, 255, 0.08)",
        boxShadow: "none",
      };
  }
}

export function getTagStyleByTagType(tag: TagType) {
  return getTagStyle(tag);
}
