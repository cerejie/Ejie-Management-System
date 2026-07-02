import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

export const page = style({
  padding: vars.space.lg,
  maxWidth: 1100,
  margin: "0 auto",
});

export const card = style({
  background: "#fff",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space.lg,
  marginBottom: vars.space.lg,
});

export const authScreen = style({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: vars.color.bg,
});

export const authCard = style({
  width: 380,
  background: "#fff",
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  padding: vars.space.xl,
});

export const positiveAmount = style({
  color: vars.color.positive,
  fontWeight: 600,
});

export const negativeAmount = style({
  color: vars.color.negative,
  fontWeight: 600,
});
