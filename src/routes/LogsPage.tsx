import { useCallback, useEffect, useState } from "react";
import { Typography, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { AppLayout } from "@/components/AppLayout";
import { listActivityLogs } from "@/lib/api";
import type { ActivityLogWithActor } from "@/types/database";
import { page } from "@/styles/layout.css";

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
  const [logs, setLogs] = useState<ActivityLogWithActor[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await listActivityLogs());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AppLayout>
      <div className={page}>
        <Typography.Title level={3}>Activity Logs</Typography.Title>

        <Table<ActivityLogWithActor>
          rowKey="id"
          loading={loading}
          dataSource={logs}
          pagination={{ pageSize: 20 }}
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
              render: (value: string) => <Tag color={actionColors[value] ?? "default"}>{value}</Tag>,
            },
            {
              title: "Details",
              key: "details",
              render: (_: unknown, row) => describe(row),
            },
          ]}
        />
      </div>
    </AppLayout>
  );
}
