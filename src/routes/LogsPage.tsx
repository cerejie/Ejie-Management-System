import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Typography, Table, Tag, Input, Empty } from "antd";
import { SearchOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { AppLayout } from "@/components/AppLayout";
import { listActivityLogs } from "@/lib/api";
import type { ActivityLogWithActor } from "@/types/database";
import { page, pageHeader, pageTitle, pageSubtitle, toolbar, surfacePanel } from "@/styles/layout.css";

const actionColors: Record<string, string> = {
  "transaction.create": "green",
  "transaction.update": "blue",
  "transaction.delete": "red",
  "employee.register": "purple",
  "employee.create": "purple",
  "employee.remove": "red",
  "employee.approve": "green",
  "employee.role_change": "gold",
};

function describe(log: ActivityLogWithActor): string {
  const d = log.details ?? {};
  switch (log.action) {
    case "transaction.create":
      return `Recorded ${d.type} of ${d.amount}`;
    case "transaction.update":
      return `Edited a transaction (${JSON.stringify(d.before)} → ${JSON.stringify(d.after)})`;
    case "transaction.delete":
      return `Deleted ${d.type} of ${d.amount}`;
    case "employee.register":
      return `${d.username} self-registered`;
    case "employee.create":
      return `Created account for ${d.username}`;
    case "employee.remove":
      return `Removed ${d.username ?? "an account"}`;
    case "employee.approve":
      return `${d.username}: ${d.from} → ${d.to}`;
    case "employee.role_change":
      return `${d.username}: ${d.from} → ${d.to}`;
    default:
      return JSON.stringify(d);
  }
}

export function LogsPage() {
  const { message } = App.useApp();
  const [logs, setLogs] = useState<ActivityLogWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await listActivityLogs());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.trim().toLowerCase();
    return logs.filter(
      (log) => log.profiles?.username?.toLowerCase().includes(q) || log.action.toLowerCase().includes(q),
    );
  }, [logs, search]);

  return (
    <AppLayout>
      <div className={page}>
        <div className={pageHeader}>
          <div>
            <Typography.Title level={3} className={pageTitle}>
              Activity logs
            </Typography.Title>
            <p className={pageSubtitle}>Full audit trail of transactions and account changes.</p>
          </div>
        </div>

        <div className={toolbar}>
          <Input
            allowClear
            placeholder="Search by actor or action"
            prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>

        <div className={surfacePanel}>
          <Table<ActivityLogWithActor>
            rowKey="id"
            loading={loading}
            dataSource={filtered}
            pagination={{ pageSize: 20, showTotal: (total) => `${total} events` }}
            scroll={{ x: 760 }}
            sticky
            locale={{
              emptyText: (
                <Empty
                  image={<FileTextOutlined style={{ fontSize: 40, color: "#D8DAE5" }} />}
                  description="No activity recorded yet"
                  style={{ padding: "32px 0" }}
                />
              ),
            }}
            columns={[
              {
                title: "Date",
                dataIndex: "created_at",
                width: 170,
                render: (value: string) => dayjs(value).format("MMM D, YYYY h:mm A"),
              },
              {
                title: "Actor",
                key: "actor",
                width: 140,
                render: (_: unknown, row) => row.profiles?.username ?? "—",
              },
              {
                title: "Action",
                dataIndex: "action",
                width: 180,
                render: (value: string) => (
                  <Tag color={actionColors[value] ?? "default"} style={{ borderRadius: 6 }}>
                    {value}
                  </Tag>
                ),
              },
              {
                title: "Details",
                key: "details",
                render: (_: unknown, row) => describe(row),
              },
            ]}
          />
        </div>
      </div>
    </AppLayout>
  );
}
