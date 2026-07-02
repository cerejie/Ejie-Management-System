import type { ReactNode } from "react";
import { WalletOutlined, TeamOutlined, DashboardOutlined, FileTextOutlined } from "@ant-design/icons";

export interface NavItem {
  key: string;
  label: string;
  icon: ReactNode;
}

export function getNavItems(isAdmin: boolean): NavItem[] {
  return isAdmin
    ? [
        { key: "/admin", icon: <DashboardOutlined />, label: "Dashboard" },
        { key: "/admin/employees", icon: <TeamOutlined />, label: "Employees" },
        { key: "/admin/logs", icon: <FileTextOutlined />, label: "Logs" },
      ]
    : [{ key: "/transactions", icon: <WalletOutlined />, label: "My Ledger" }];
}
