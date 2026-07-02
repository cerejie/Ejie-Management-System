import { useCallback, useEffect, useState } from "react";
import { Typography, Table, Tag, Button, message, Popconfirm } from "antd";
import dayjs from "dayjs";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/store/auth-store";
import { listProfiles, setProfileRole } from "@/lib/api";
import type { Profile } from "@/types/database";
import { page } from "@/styles/layout.css";

export function EmployeesPage() {
  const currentProfile = useAuthStore((s) => s.profile);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfiles(await listProfiles());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRole(row: Profile) {
    const nextRole = row.role === "admin" ? "employee" : "admin";
    try {
      await setProfileRole(row.id, nextRole);
      message.success(`${row.email} is now ${nextRole}`);
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  return (
    <AppLayout>
      <div className={page}>
        <Typography.Title level={3}>Employees</Typography.Title>

        <Table<Profile>
          rowKey="id"
          loading={loading}
          dataSource={profiles}
          pagination={false}
          columns={[
            { title: "Name", dataIndex: "full_name", render: (v: string | null) => v || "—" },
            { title: "Email", dataIndex: "email" },
            {
              title: "Role",
              dataIndex: "role",
              render: (value: Profile["role"]) => (
                <Tag color={value === "admin" ? "gold" : "blue"}>{value}</Tag>
              ),
            },
            {
              title: "Joined",
              dataIndex: "created_at",
              render: (value: string) => dayjs(value).format("MMM D, YYYY"),
            },
            {
              title: "Actions",
              key: "actions",
              render: (_: unknown, row: Profile) =>
                row.id === currentProfile?.id ? null : (
                  <Popconfirm
                    title={`Make ${row.email} ${row.role === "admin" ? "an employee" : "an admin"}?`}
                    onConfirm={() => toggleRole(row)}
                  >
                    <Button size="small">
                      {row.role === "admin" ? "Demote to employee" : "Promote to admin"}
                    </Button>
                  </Popconfirm>
                ),
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}
