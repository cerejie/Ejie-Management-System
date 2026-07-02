import { createGlobalTheme } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  color: {
    brand: "#1677ff",
    positive: "#389e0d",
    negative: "#cf1322",
    bg: "#f5f7fa",
    border: "#e5e7eb",
    text: "#1f2937",
    textMuted: "#6b7280",
  },
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  radius: {
    sm: "6px",
    md: "10px",
  },
});
