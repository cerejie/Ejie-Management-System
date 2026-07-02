import { Table, Tag, Space, Button, Popconfirm, Tooltip, Empty } from "antd";
import { EditOutlined, DeleteOutlined, InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Transaction, TransactionWithAuthor } from "@/types/database";
import { positiveAmount, negativeAmount } from "@/styles/layout.css";

type Row = Transaction | TransactionWithAuthor;

function hasAuthor(row: Row): row is TransactionWithAuthor {
  return "profiles" in row;
}

interface TransactionTableProps<T extends Row> {
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function TransactionTable<T extends Row>({ data, loading, onEdit, onDelete }: TransactionTableProps<T>) {
  const showAuthor = data.length > 0 && hasAuthor(data[0]);
  const showActions = Boolean(onEdit || onDelete);

  return (
    <Table<T>
      rowKey="id"
      loading={loading}
      dataSource={data}
      pagination={{ pageSize: 10, showTotal: (total) => `${total} entries` }}
      scroll={{ x: 720 }}
      sticky
      locale={{
        emptyText: (
          <Empty
            image={<InboxOutlined style={{ fontSize: 40, color: "#D8DAE5" }} />}
            description="No entries yet"
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
        ...(showAuthor
          ? [
              {
                title: "Recorded by",
                key: "author",
                width: 140,
                render: (_: unknown, row: T) => (hasAuthor(row) ? row.profiles?.username ?? "—" : "—"),
              },
            ]
          : []),
        {
          title: "Type",
          dataIndex: "type",
          width: 120,
          render: (value: Transaction["type"]) => (
            <Tag color={value === "deposit" ? "green" : "red"} style={{ borderRadius: 6 }}>
              {value === "deposit" ? "Money In" : "Money Out"}
            </Tag>
          ),
        },
        {
          title: "Amount",
          dataIndex: "amount",
          width: 140,
          render: (value: number, row: T) => (
            <span className={row.type === "deposit" ? positiveAmount : negativeAmount}>
              {row.type === "deposit" ? "+" : "-"}
              {value.toFixed(2)}
            </span>
          ),
        },
        {
          title: "Note",
          dataIndex: "note",
          ellipsis: true,
          render: (value: string | null) => value || "—",
        },
        ...(showActions
          ? [
              {
                title: "Actions",
                key: "actions",
                width: 100,
                fixed: "right" as const,
                render: (_: unknown, row: T) => (
                  <Space size={4}>
                    {onEdit && (
                      <Tooltip title="Edit">
                        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => onEdit(row)} />
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Popconfirm title="Delete this entry?" onConfirm={() => onDelete(row)}>
                        <Tooltip title="Delete">
                          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                      </Popconfirm>
                    )}
                  </Space>
                ),
              },
            ]
          : []),
      ]}
    />
  );
}
