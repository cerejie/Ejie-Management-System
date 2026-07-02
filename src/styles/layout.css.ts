import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";
import { mobileDown } from "@/styles/breakpoints.css";

export const page = style({
  padding: `${vars.space.xl} ${vars.space.xl} ${vars.space.xxl}`,
  maxWidth: 1180,
  margin: "0 auto",
  width: "100%",
  "@media": {
    [mobileDown]: {
      padding: `${vars.space.md} ${vars.space.md} ${vars.space.xl}`,
    },
  },
});

export const pageHeader = style({
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: vars.space.md,
  marginBottom: vars.space.xl,
});

export const pageTitle = style({
  margin: 0,
  fontWeight: 700,
  letterSpacing: "-0.02em",
});

export const pageSubtitle = style({
  margin: 0,
  marginTop: 4,
  color: vars.color.textMuted,
  fontSize: 14,
});

export const toolbar = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: vars.space.sm,
  marginBottom: vars.space.md,
  "@media": {
    [mobileDown]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
});

export const toolbarField = style({
  maxWidth: 280,
  "@media": {
    [mobileDown]: {
      maxWidth: "none",
      width: "100%",
    },
  },
});

export const filterBarCentered = style({
  marginBottom: vars.space.md,
  "@media": {
    [mobileDown]: {
      display: "flex",
      justifyContent: "center",
    },
  },
});

export const filterControl = style({
  "@media": {
    [mobileDown]: {
      width: "auto",
    },
  },
});

export const card = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.lg,
  marginBottom: vars.space.lg,
  boxShadow: vars.shadow.xs,
});

export const surfacePanel = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.xs,
  overflow: "hidden",
});

export const authScreen = style({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: vars.space.lg,
  background:
    "radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.10), transparent 45%)," +
    "radial-gradient(circle at 85% 85%, rgba(79, 70, 229, 0.08), transparent 45%)," +
    `${vars.color.bg}`,
});

export const authBrand = style({
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: vars.space.lg,
  fontSize: 16,
  fontWeight: 700,
  color: vars.color.text,
  letterSpacing: "-0.01em",
});

export const authBrandMark = style({
  width: 34,
  height: 34,
  borderRadius: vars.radius.md,
  background: vars.color.brand,
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 15,
  boxShadow: "0 6px 16px rgba(79, 70, 229, 0.35)",
});

export const authCard = style({
  width: 400,
  maxWidth: "100%",
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.xl,
  padding: vars.space.xl,
  boxShadow: vars.shadow.lg,
});

export const authFooterText = style({
  marginTop: vars.space.lg,
  textAlign: "center",
  color: vars.color.textMuted,
  fontSize: 14,
});

export const desktopOnly = style({
  "@media": {
    [mobileDown]: {
      display: "none",
    },
  },
});

export const fab = style({
  display: "none",
  "@media": {
    [mobileDown]: {
      display: "flex",
    },
  },
  position: "fixed",
  right: vars.space.lg,
  bottom: `calc(64px + env(safe-area-inset-bottom) + ${vars.space.lg})`,
  width: 56,
  height: 56,
  borderRadius: "50%",
  background: vars.color.brand,
  color: "#fff",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 22,
  border: "none",
  boxShadow: "0 8px 20px rgba(79, 70, 229, 0.4)",
  zIndex: 101,
  cursor: "pointer",
});

export const positiveAmount = style({
  color: vars.color.positive,
  fontWeight: 600,
});

export const negativeAmount = style({
  color: vars.color.negative,
  fontWeight: 600,
});
