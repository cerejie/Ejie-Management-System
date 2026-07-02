import { useState } from "react";
import { Table, Tag, Space, Button, Popconfirm, Tooltip, Empty, Spin } from "antd";
import { EditOutlined, DeleteOutlined, InboxOutlined, DownOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Transaction, TransactionWithAuthor } from "@/types/database";
import { positiveAmount, negativeAmount, desktopOnly } from "@/styles/layout.css";
import { vars } from "@/styles/theme.css";
import {
  listWrap,
  listItem,
  row as rowStyle,
  iconCircle,
  body as bodyStyle,
  title as titleStyle,
  meta as metaStyle,
  right,
  amount as amountStyle,
  chevron,
  chevronOpen,
  actions,
  emptyWrap,
} from "@/styles/rowList.css";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <>
      <div className={desktopOnly}>
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
      </div>

      <div className={listWrap}>
        {data.length === 0 && !loading && (
          <div className={emptyWrap}>
            <Empty image={<InboxOutlined style={{ fontSize: 40, color: "#D8DAE5" }} />} description="No entries yet" />
          </div>
        )}
        <Spin spinning={Boolean(loading)}>
          {data.map((txn) => {
            const isExpanded = expandedId === txn.id;
            const isDeposit = txn.type === "deposit";
            const subtitle = [
              dayjs(txn.created_at).format("MMM D, h:mm A"),
              showAuthor && hasAuthor(txn) ? txn.profiles?.username ?? "—" : null,
              txn.note,
            ]
              .filter(Boolean)
              .join(" · ");
            return (
              <div key={txn.id} className={listItem}>
                <div
                  className={rowStyle}
                  onClick={() => showActions && setExpandedId(isExpanded ? null : txn.id)}
                >
                  <div
                    className={iconCircle}
                    style={{
                      color: isDeposit ? vars.color.positive : vars.color.negative,
                      background: isDeposit ? vars.color.positiveSoft : vars.color.negativeSoft,
                    }}
                  >
                    {isDeposit ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  </div>
                  <div className={bodyStyle}>
                    <div className={titleStyle}>{isDeposit ? "Money In" : "Money Out"}</div>
                    <div className={metaStyle}>{subtitle}</div>
                  </div>
                  <div className={right}>
                    <span className={`${amountStyle} ${isDeposit ? positiveAmount : negativeAmount}`}>
                      {isDeposit ? "+" : "-"}
                      {txn.amount.toFixed(2)}
                    </span>
                    {showActions && (
                      <DownOutlined className={`${chevron} ${isExpanded ? chevronOpen : ""}`} />
                    )}
                  </div>
                </div>
                {showActions && isExpanded && (
                  <div className={actions} onClick={(e) => e.stopPropagation()}>
                    {onEdit && (
                      <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(txn)}>
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Popconfirm title="Delete this entry?" onConfirm={() => onDelete(txn)}>
                        <Button size="small" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </Spin>
      </div>
    </>
  );
}
