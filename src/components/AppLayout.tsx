import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Button, Tag } from "antd";
import type { MenuProps } from "antd";
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { getNavItems } from "@/lib/nav-items";
import { BottomNav } from "@/components/BottomNav";
import {
  sider,
  sidebarBrand,
  sidebarBrandMark,
  sidebarBrandText,
  header,
  headerLeft,
  headerTitle,
  collapseTrigger,
  userTrigger,
  userMeta,
  userName,
  userRole,
  contentOuter,
} from "@/styles/appLayout.css";

const { Header, Sider, Content } = Layout;

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/employees": "Employees",
  "/admin/logs": "Activity logs",
  "/transactions": "My ledger",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);

  const isAdmin = profile?.role === "admin";

  const navItems = getNavItems(isAdmin);
  const items = navItems.map((navItem) => ({
    key: navItem.key,
    icon: navItem.icon,
    label: <Link to={navItem.key}>{navItem.label}</Link>,
  }));

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div style={{ padding: "2px 4px" }}>
          <div style={{ fontWeight: 600 }}>{profile?.username}</div>
          <div style={{ fontSize: 12, color: "#6B7280", textTransform: "capitalize" }}>{profile?.role}</div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "signout",
      label: "Sign out",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleSignOut,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        className={sider}
        breakpoint="lg"
        collapsedWidth="0"
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={232}
        trigger={null}
      >
        <div className={sidebarBrand}>
          <div className={sidebarBrandMark}>EJ</div>
          <span className={sidebarBrandText}>Ejie Layouts Monitoring </span>
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={items} />
      </Sider>
      <Layout>
        <Header className={header}>
          <div className={headerLeft}>
            <Button
              className={collapseTrigger}
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((c) => !c)}
            />
            <h1 className={headerTitle}>{pageTitles[pathname] ?? "Overview"}</h1>
          </div>

          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
            <div className={userTrigger}>
              <Avatar style={{ backgroundColor: "#4F46E5" }}>
                {profile?.username?.[0]?.toUpperCase() ?? "?"}
              </Avatar>
              <div className={userMeta}>
                <span className={userName}>{profile?.username}</span>
                <span className={userRole}>
                  <Tag
                    color={isAdmin ? "gold" : "blue"}
                    style={{ marginInlineEnd: 0, lineHeight: "16px", fontSize: 11, padding: "0 6px" }}
                  >
                    {profile?.role}
                  </Tag>
                </span>
              </div>
              <DownOutlined style={{ fontSize: 10, color: "#9CA3AF" }} />
            </div>
          </Dropdown>
        </Header>
        <Content className={contentOuter}>{children}</Content>
      </Layout>
      <BottomNav items={navItems} pathname={pathname} />
    </Layout>
  );
}
