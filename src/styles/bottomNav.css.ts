import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";
import { mobileDown } from "@/styles/breakpoints.css";

export const bar = style({
  display: "none",
  "@media": {
    [mobileDown]: {
      display: "flex",
    },
  },
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 100,
  alignItems: "stretch",
  justifyContent: "space-around",
  background: vars.color.surface,
  borderTop: `1px solid ${vars.color.border}`,
  boxShadow: "0 -4px 16px rgba(16, 24, 40, 0.06)",
  paddingBottom: "env(safe-area-inset-bottom)",
});

export const item = style({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  padding: "8px 4px 6px",
  color: vars.color.textFaint,
  fontSize: 11,
  fontWeight: 500,
  textDecoration: "none",
  selectors: {
    "&:hover": {
      color: vars.color.textFaint,
    },
  },
});

export const itemActive = style({
  color: vars.color.brand,
  selectors: {
    "&:hover": {
      color: vars.color.brand,
    },
  },
});

export const icon = style({
  fontSize: 20,
  lineHeight: 1,
});
