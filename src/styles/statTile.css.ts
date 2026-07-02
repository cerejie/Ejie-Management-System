import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const tile = style({
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  padding: vars.space.lg,
  boxShadow: vars.shadow.xs,
  display: "flex",
  alignItems: "flex-start",
  gap: vars.space.md,
  height: "100%",
});

export const iconBadge = style({
  width: 40,
  height: 40,
  flexShrink: 0,
  borderRadius: vars.radius.md,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
});

export const body = style({
  minWidth: 0,
});

export const label = style({
  fontSize: 13,
  color: vars.color.textMuted,
  fontWeight: 500,
  marginBottom: 6,
});

export const value = style({
  fontSize: 24,
  fontWeight: 700,
  letterSpacing: "-0.01em",
  lineHeight: 1.2,
});
