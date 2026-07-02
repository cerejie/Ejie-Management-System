import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const sider = style({
  borderRight: `1px solid ${vars.color.sidebarBorder}`,
});

export const sidebarBrand = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: `18px 20px`,
  marginBottom: vars.space.sm,
});

export const sidebarBrandMark = style({
  width: 30,
  height: 30,
  flexShrink: 0,
  borderRadius: vars.radius.sm,
  background: vars.color.brand,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 14,
});

export const sidebarBrandText = style({
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const header = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: vars.space.md,
  borderBottom: `1px solid ${vars.color.border}`,
});

export const headerLeft = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  minWidth: 0,
});

export const headerTitle = style({
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
  color: vars.color.text,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const collapseTrigger = style({
  display: "none",
  "@media": {
    "screen and (max-width: 991px)": {
      display: "inline-flex",
    },
  },
});

export const userTrigger = style({
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px 6px 6px",
  borderRadius: vars.radius.md,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  selectors: {
    "&:hover": {
      backgroundColor: vars.color.surfaceHover,
    },
  },
});

export const userMeta = style({
  display: "flex",
  flexDirection: "column",
  lineHeight: 1.3,
  "@media": {
    "screen and (max-width: 575px)": {
      display: "none",
    },
  },
});

export const userName = style({
  fontSize: 13,
  fontWeight: 600,
  color: vars.color.text,
});

export const userRole = style({
  fontSize: 12,
  color: vars.color.textMuted,
  textTransform: "capitalize",
});

export const contentOuter = style({
  minHeight: "calc(100vh - 64px)",
});
