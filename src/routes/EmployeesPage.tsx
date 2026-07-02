import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Typography, Table, Tag, Button, Modal, Form, Input, Space, Dropdown, Avatar, Empty } from "antd";
import type { MenuProps } from "antd";
import { PlusOutlined, SearchOutlined, MoreOutlined, UserAddOutlined } from "@ant-design/icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/store/auth-store";
import {
  approveProfile,
  createEmployeeAccount,
  deleteEmployeeAccount,
  listProfiles,
  setProfileRole,
} from "@/lib/api";
import type { Profile } from "@/types/database";
import { createEmployeeSchema, type CreateEmployeeFormValues } from "@/schemas/auth-schema";
import { page, pageHeader, pageTitle, pageSubtitle, toolbar, surfacePanel } from "@/styles/layout.css";

function AddEmployeeModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: { username: "", password: "" },
  });

  async function submit(values: CreateEmployeeFormValues) {
    setSubmitting(true);
    try {
      await createEmployeeAccount(values);
      message.success(`Account created for ${values.username}`);
      reset();
      onCreated();
      onClose();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to create employee account");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add employee" open={open} onCancel={onClose} footer={null} destroyOnHidden>
      <Form layout="vertical" requiredMark="optional" onFinish={handleSubmit(submit)}>
        <Form.Item label="Username" validateStatus={errors.username ? "error" : ""} help={errors.username?.message}>
          <Controller control={control} name="username" render={({ field }) => <Input {...field} autoComplete="username" />} />
        </Form.Item>

        <Form.Item label="Password" validateStatus={errors.password ? "error" : ""} help={errors.password?.message}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => <Input.Password {...field} autoComplete="new-password" />}
          />
        </Form.Item>

        <Typography.Paragraph type="secondary" style={{ marginTop: -8, fontSize: 13 }}>
          Employees you add here are approved automatically.
        </Typography.Paragraph>

        <Button type="primary" htmlType="submit" loading={submitting} block>
          Create account
        </Button>
      </Form>
    </Modal>
  );
}

export function EmployeesPage() {
  const { message, modal } = App.useApp();
  const currentProfile = useAuthStore((s) => s.profile);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProfiles(await listProfiles());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles;
    const q = search.trim().toLowerCase();
    return profiles.filter(
      (p) => p.username.toLowerCase().includes(q) || p.full_name?.toLowerCase().includes(q),
    );
  }, [profiles, search]);

  async function toggleRole(row: Profile) {
    const nextRole = row.role === "admin" ? "employee" : "admin";
    try {
      await setProfileRole(row.id, nextRole);
      message.success(`${row.username} is now ${nextRole}`);
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to update role");
    }
  }

  async function approve(row: Profile) {
    try {
      await approveProfile(row.id);
      message.success(`${row.username} approved`);
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to approve account");
    }
  }

  async function remove(row: Profile) {
    try {
      await deleteEmployeeAccount(row.id);
      message.success(`${row.username} removed`);
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to remove account");
    }
  }

  function confirmApprove(row: Profile) {
    modal.confirm({
      title: `Approve ${row.username}?`,
      onOk: () => approve(row),
    });
  }

  function confirmToggleRole(row: Profile) {
    const willBe = row.role === "admin" ? "an employee" : "an admin";
    modal.confirm({
      title: `Make ${row.username} ${willBe}?`,
      onOk: () => toggleRole(row),
    });
  }

  function confirmRemove(row: Profile) {
    modal.confirm({
      title: `Remove ${row.username}?`,
      content: "This deletes their login and all their recorded entries. This can't be undone.",
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: () => remove(row),
    });
  }

  function actionsFor(row: Profile): MenuProps["items"] {
    const items: MenuProps["items"] = [];
    if (row.status === "pending") {
      items.push({ key: "approve", label: "Approve" });
    }
    items.push({
      key: "role",
      label: row.role === "admin" ? "Demote to employee" : "Promote to admin",
    });
    items.push({ type: "divider" });
    items.push({ key: "remove", label: "Remove", danger: true });
    return items;
  }

  function handleAction(row: Profile, key: string) {
    if (key === "approve") confirmApprove(row);
    if (key === "role") confirmToggleRole(row);
    if (key === "remove") confirmRemove(row);
  }

  return (
    <AppLayout>
      <div className={page}>
        <div className={pageHeader}>
          <div>
            <Typography.Title level={3} className={pageTitle}>
              Employees
            </Typography.Title>
            <p className={pageSubtitle}>Manage accounts, approvals, and roles.</p>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
            Add employee
          </Button>
        </div>

        <div className={toolbar}>
          <Input
            allowClear
            placeholder="Search by name or username"
            prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>

        <div className={surfacePanel}>
          <Table<Profile>
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={false}
            scroll={{ x: 720 }}
            locale={{
              emptyText: (
                <Empty
                  image={<UserAddOutlined style={{ fontSize: 40, color: "#D8DAE5" }} />}
                  description="No employees found"
                  style={{ padding: "32px 0" }}
                >
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
                    Add employee
                  </Button>
                </Empty>
              ),
            }}
            columns={[
              {
                title: "Name",
                key: "name",
                render: (_: unknown, row: Profile) => (
                  <Space>
                    <Avatar size={28} style={{ backgroundColor: "#4F46E5", fontSize: 12 }}>
                      {row.username[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 500 }}>{row.full_name || row.username}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>@{row.username}</div>
                    </div>
                  </Space>
                ),
              },
              {
                title: "Role",
                dataIndex: "role",
                width: 110,
                render: (value: Profile["role"]) => (
                  <Tag color={value === "admin" ? "gold" : "blue"} style={{ borderRadius: 6 }}>
                    {value}
                  </Tag>
                ),
              },
              {
                title: "Status",
                dataIndex: "status",
                width: 120,
                render: (value: Profile["status"]) => (
                  <Tag color={value === "approved" ? "green" : "orange"} style={{ borderRadius: 6 }}>
                    {value}
                  </Tag>
                ),
              },
              {
                title: "Joined",
                dataIndex: "created_at",
                width: 130,
                render: (value: string) => dayjs(value).format("MMM D, YYYY"),
              },
              {
                title: "",
                key: "actions",
                width: 60,
                fixed: "right" as const,
                render: (_: unknown, row: Profile) =>
                  row.id === currentProfile?.id ? null : (
                    <Dropdown
                      menu={{ items: actionsFor(row), onClick: ({ key }) => handleAction(row, key) }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button size="small" type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  ),
              },
            ]}
          />
        </div>
      </div>

      <AddEmployeeModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
    </AppLayout>
  );
}
