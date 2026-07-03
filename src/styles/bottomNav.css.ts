import { style } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";
import { mobileDown } from "@/styles/breakpoints.css";

export const NAV_ITEM_SIZE = 48;
export const NAV_ITEM_GAP = 6;
export const NAV_PADDING = 6;
export const NAV_BOTTOM_MARGIN = 14;
export const NAV_PILL_HEIGHT = NAV_ITEM_SIZE + NAV_PADDING * 2;
// The whole pill never gets narrower than this, so a single-tab nav still
// reads as a bar rather than a lone circle.
export const NAV_MIN_WIDTH = 168;
// Outer corners of the end tabs (and the indicator when it sits on an end)
// match the pill's rounded edge, which for a 48px-tall track is a semicircle.
export const NAV_END_RADIUS = NAV_ITEM_SIZE / 2;

export const bar = style({
  display: "none",
  "@media": {
    [mobileDown]: {
      display: "flex",
    },
  },
  position: "fixed",
  left: "50%",
  bottom: `calc(${NAV_BOTTOM_MARGIN}px + env(safe-area-inset-bottom))`,
  transform: "translateX(-50%)",
  zIndex: 100,
  padding: NAV_PADDING,
  borderRadius: 999,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  boxShadow: "0 8px 24px rgba(16, 24, 40, 0.14)",
  // Floor the pill width; when there is spare room the tabs inside stretch to
  // fill it (see `item`'s flex), so a lone tab claims the whole bar.
  minWidth: NAV_MIN_WIDTH,
  maxWidth: `calc(100vw - ${vars.space.lg} * 2)`,
});

export const track = style({
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: NAV_ITEM_GAP,
  // Fill the pill so the flexible tabs can distribute its width.
  flex: 1,
  minWidth: 0,
});

export const indicator = style({
  position: "absolute",
  top: 0,
  left: 0,
  width: NAV_ITEM_SIZE,
  height: NAV_ITEM_SIZE,
  borderRadius: vars.radius.lg,
  background: vars.color.brand,
  transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
  willChange: "transform",
});

export const item = style({
  position: "relative",
  zIndex: 1,
  // Tabs share the track width equally, but never collapse below one icon's
  // worth of space, so adding tabs grows the pill instead of crushing them.
  flex: "1 1 0",
  minWidth: NAV_ITEM_SIZE,
  height: NAV_ITEM_SIZE,
  borderRadius: vars.radius.lg,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: vars.color.textFaint,
  textDecoration: "none",
  transition: "color 0.25s ease",
  selectors: {
    "&:hover": {
      color: vars.color.textFaint,
    },
  },
});

export const itemActive = style({
  color: "#fff",
  selectors: {
    "&:hover": {
      color: "#fff",
    },
  },
});

export const icon = style({
  fontSize: 20,
  lineHeight: 1,
});
