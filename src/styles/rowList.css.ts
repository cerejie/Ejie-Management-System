import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";
import { mobileDown } from "@/styles/breakpoints.css";

export const listWrap = style({
  display: "none",
  "@media": {
    [mobileDown]: {
      display: "block",
    },
  },
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  boxShadow: vars.shadow.xs,
  overflow: "hidden",
});

export const listItem = style({
  borderBottom: `1px solid ${vars.color.border}`,
  selectors: {
    "&:last-child": {
      borderBottom: "none",
    },
  },
});

export const row = style({
  display: "flex",
  alignItems: "center",
  gap: vars.space.sm,
  padding: "10px 14px",
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  selectors: {
    "&:active": {
      backgroundColor: vars.color.surfaceHover,
    },
  },
});

export const iconCircle = style({
  width: 34,
  height: 34,
  flexShrink: 0,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 14,
});

export const body = style({
  flex: 1,
  minWidth: 0,
});

export const title = style({
  fontSize: 13.5,
  fontWeight: 600,
  color: vars.color.text,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const meta = style({
  marginTop: 1,
  fontSize: 11.5,
  color: vars.color.textMuted,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const right = style({
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  gap: 6,
});

export const amount = style({
  fontSize: 13.5,
  fontWeight: 700,
  whiteSpace: "nowrap",
});

export const chevron = style({
  color: vars.color.textFaint,
  fontSize: 10,
  transition: "transform 0.15s ease",
});

export const chevronOpen = style({
  transform: "rotate(180deg)",
});

export const actions = style({
  display: "flex",
  flexWrap: "wrap",
  gap: vars.space.sm,
  padding: "0 14px 12px 56px",
});

export const emptyWrap = style({
  padding: "32px 0",
});
