import { useCallback, useEffect, useState } from "react";
import { Typography, Table, Tag, Button, message, Popconfirm, Modal, Form, Input, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
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
import { page } from "@/styles/layout.css";

function AddEmployeeModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
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
    <Modal
      title="Add employee"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <Form layout="vertical" onFinish={handleSubmit(submit)}>
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

        <Typography.Paragraph type="secondary" style={{ marginTop: -8 }}>
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
  const currentProfile = useAuthStore((s) => s.profile);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

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

  return (
    <AppLayout>
      <div className={page}>
        <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            Employees
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddOpen(true)}>
            Add employee
          </Button>
        </Space>

        <Table<Profile>
          rowKey="id"
          loading={loading}
          dataSource={profiles}
          pagination={false}
          columns={[
            { title: "Name", dataIndex: "full_name", render: (v: string | null) => v || "—" },
            { title: "Username", dataIndex: "username" },
            {
              title: "Role",
              dataIndex: "role",
              render: (value: Profile["role"]) => (
                <Tag color={value === "admin" ? "gold" : "blue"}>{value}</Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (value: Profile["status"]) => (
                <Tag color={value === "approved" ? "green" : "orange"}>{value}</Tag>
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
                  <Space>
                    {row.status === "pending" && (
                      <Popconfirm title={`Approve ${row.username}?`} onConfirm={() => approve(row)}>
                        <Button size="small" type="primary">
                          Approve
                        </Button>
                      </Popconfirm>
                    )}
                    <Popconfirm
                      title={`Make ${row.username} ${row.role === "admin" ? "an employee" : "an admin"}?`}
                      onConfirm={() => toggleRole(row)}
                    >
                      <Button size="small">
                        {row.role === "admin" ? "Demote to employee" : "Promote to admin"}
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      title={`Remove ${row.username}? This deletes their login and all their recorded entries.`}
                      onConfirm={() => remove(row)}
                    >
                      <Button size="small" danger>
                        Remove
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
            },
          ]}
        />
      </div>

      <AddEmployeeModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={load} />
    </AppLayout>
  );
}
