import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConfigProvider, App as AntApp } from "antd";
import { App } from "@/App";
import "@/styles/global.css";

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Inter, Helvetica, Arial, sans-serif";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4F46E5",
          colorPrimaryHover: "#4338CA",
          colorSuccess: "#059669",
          colorError: "#DC2626",
          colorWarning: "#D97706",
          colorInfo: "#4F46E5",
          colorBgLayout: "#F6F7FB",
          colorBgContainer: "#FFFFFF",
          colorBorder: "#E7E8EF",
          colorBorderSecondary: "#EDEEF3",
          colorText: "#111827",
          colorTextSecondary: "#6B7280",
          colorTextTertiary: "#9CA3AF",
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,
          fontFamily,
          fontSize: 14,
          controlHeight: 38,
          boxShadow: "0 4px 12px rgba(16, 24, 40, 0.06), 0 2px 4px rgba(16, 24, 40, 0.04)",
          boxShadowSecondary: "0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)",
        },
        components: {
          Layout: {
            headerBg: "#FFFFFF",
            bodyBg: "#F6F7FB",
            siderBg: "#0B0E14",
            headerHeight: 64,
            headerPadding: "0 24px",
          },
          Menu: {
            darkItemBg: "#0B0E14",
            darkItemColor: "#B4B8C5",
            darkItemHoverBg: "#141822",
            darkItemHoverColor: "#FFFFFF",
            darkItemSelectedBg: "#171B26",
            darkItemSelectedColor: "#FFFFFF",
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemHeight: 40,
          },
          Card: {
            borderRadiusLG: 14,
            boxShadowTertiary: "0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)",
          },
          Table: {
            headerBg: "#FAFAFC",
            headerColor: "#6B7280",
            borderColor: "#EDEEF3",
            rowHoverBg: "#FAFAFC",
            headerBorderRadius: 12,
            cellPaddingBlock: 14,
          },
          Button: {
            controlHeight: 38,
            fontWeight: 500,
            primaryShadow: "none",
          },
          Input: {
            controlHeight: 38,
            activeShadow: "0 0 0 3px rgba(79, 70, 229, 0.12)",
          },
          InputNumber: {
            controlHeight: 38,
          },
          Select: {
            controlHeight: 38,
          },
          Modal: {
            borderRadiusLG: 16,
          },
          Tag: {
            borderRadiusSM: 6,
          },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
