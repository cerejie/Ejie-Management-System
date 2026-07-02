import { Table, Tag, Space, Button, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Transaction, TransactionWithAuthor } from "@/types/database";
import { positiveAmount, negativeAmount } from "@/styles/layout.css";

type Row = Transaction | TransactionWithAuthor;

function hasAuthor(row: Row): row is TransactionWithAuthor {
  return "profiles" in row;
}

interface TransactionTableProps {
  data: Row[];
  loading?: boolean;
  onEdit?: (row: TransactionWithAuthor) => void;
  onDelete?: (row: TransactionWithAuthor) => void;
}

export function TransactionTable({ data, loading, onEdit, onDelete }: TransactionTableProps) {
  const showAuthor = data.length > 0 && hasAuthor(data[0]);
  const showActions = Boolean(onEdit || onDelete);

  return (
    <Table<Row>
      rowKey="id"
      loading={loading}
      dataSource={data}
      pagination={{ pageSize: 10 }}
      columns={[
        {
          title: "Date",
          dataIndex: "created_at",
          width: 160,
          render: (value: string) => dayjs(value).format("MMM D, YYYY h:mm A"),
        },
        ...(showAuthor
          ? [
              {
                title: "Recorded by",
                key: "author",
                render: (_: unknown, row: Row) =>
                  hasAuthor(row) ? row.profiles?.full_name ?? row.profiles?.email ?? "—" : "—",
              },
            ]
          : []),
        {
          title: "Type",
          dataIndex: "type",
          width: 120,
          render: (value: Transaction["type"]) => (
            <Tag color={value === "deposit" ? "green" : "red"}>
              {value === "deposit" ? "Money In" : "Money Out"}
            </Tag>
          ),
        },
        {
          title: "Amount",
          dataIndex: "amount",
          width: 140,
          render: (value: number, row: Row) => (
            <span className={row.type === "deposit" ? positiveAmount : negativeAmount}>
              {row.type === "deposit" ? "+" : "-"}
              {value.toFixed(2)}
            </span>
          ),
        },
        {
          title: "Note",
          dataIndex: "note",
          render: (value: string | null) => value || "—",
        },
        ...(showActions
          ? [
              {
                title: "Actions",
                key: "actions",
                width: 120,
                render: (_: unknown, row: Row) =>
                  hasAuthor(row) ? (
                    <Space>
                      {onEdit && (
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => onEdit(row)}
                        />
                      )}
                      {onDelete && (
                        <Popconfirm
                          title="Delete this entry?"
                          onConfirm={() => onDelete(row)}
                        >
                          <Button size="small" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                      )}
                    </Space>
                  ) : null,
              },
            ]
          : []),
      ]}
    />
  );
}
