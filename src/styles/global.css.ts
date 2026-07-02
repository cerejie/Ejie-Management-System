import { globalStyle } from "@vanilla-extract/css";
import { vars } from "@/styles/theme.css";

globalStyle("html, body, #root", {
  height: "100%",
  margin: 0,
});

globalStyle("body", {
  backgroundColor: vars.color.bg,
  color: vars.color.text,
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
});
