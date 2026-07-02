import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { Spin } from "antd";
import { router } from "@/router";
import { useAuthStore } from "@/store/auth-store";

export function App() {
  const status = useAuthStore((s) => s.status);

  useEffect(() => useAuthStore.getState().initialize(), []);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
