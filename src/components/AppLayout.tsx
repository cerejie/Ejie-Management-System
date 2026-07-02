import { Layout, Menu, Space, Typography, Button, Tag } from "antd";
import { LogoutOutlined, WalletOutlined, TeamOutlined, DashboardOutlined, FileTextOutlined } from "@ant-design/icons";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";

const { Header, Sider, Content } = Layout;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isAdmin = profile?.role === "admin";

  const items = isAdmin
    ? [
        { key: "/admin", icon: <DashboardOutlined />, label: <Link to="/admin">Dashboard</Link> },
        { key: "/admin/employees", icon: <TeamOutlined />, label: <Link to="/admin/employees">Employees</Link> },
        { key: "/admin/logs", icon: <FileTextOutlined />, label: <Link to="/admin/logs">Logs</Link> },
      ]
    : [
        { key: "/transactions", icon: <WalletOutlined />, label: <Link to="/transactions">My Ledger</Link> },
      ];

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ color: "#fff", padding: 16, fontWeight: 600, fontSize: 16 }}>
          Money Tracker
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[pathname]} items={items} />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
          <Space>
            <Typography.Text>{profile?.username}</Typography.Text>
            <Tag color={isAdmin ? "gold" : "blue"}>{profile?.role}</Tag>
            <Button icon={<LogoutOutlined />} onClick={handleSignOut}>
              Sign out
            </Button>
          </Space>
        </Header>
        <Content>{children}</Content>
      </Layout>
    </Layout>
  );
}
