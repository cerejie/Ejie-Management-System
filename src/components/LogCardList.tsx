import { useState } from "react";
import { Tag, Empty, Spin } from "antd";
import { FileTextOutlined, HistoryOutlined, DownOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ActivityLogWithActor } from "@/types/database";
import { listWrap, listItem, row, iconCircle, body, title, meta, right, chevron, chevronOpen, actions, emptyWrap } from "@/styles/rowList.css";
import { vars } from "@/styles/theme.css";

interface LogCardListProps {
  logs: ActivityLogWithActor[];
  loading?: boolean;
  actionColors: Record<string, string>;
  describe: (log: ActivityLogWithActor) => string;
}

export function LogCardList({ logs, loading, actionColors, describe }: LogCardListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={listWrap}>
      {logs.length === 0 && !loading && (
        <div className={emptyWrap}>
          <Empty image={<FileTextOutlined style={{ fontSize: 40, color: "#D8DAE5" }} />} description="No activity recorded yet" />
        </div>
      )}
      <Spin spinning={Boolean(loading)}>
        {logs.map((log) => {
          const isExpanded = expandedId === log.id;
          return (
            <div key={log.id} className={listItem}>
              <div className={row} onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                <div className={iconCircle} style={{ color: vars.color.brand, background: vars.color.brandSoft }}>
                  <HistoryOutlined />
                </div>
                <div className={body}>
                  <div className={title}>{describe(log)}</div>
                  <div className={meta}>
                    {log.profiles?.username ?? "—"} · {dayjs(log.created_at).format("MMM D, h:mm A")}
                  </div>
                </div>
                <div className={right}>
                  <Tag color={actionColors[log.action] ?? "default"} style={{ borderRadius: 6, margin: 0 }}>
                    {log.action}
                  </Tag>
                  <DownOutlined className={`${chevron} ${isExpanded ? chevronOpen : ""}`} />
                </div>
              </div>
              {isExpanded && (
                <div className={actions} style={{ display: "block" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ fontSize: 12.5, color: vars.color.text, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {describe(log)}
                  </div>
                  <div className={meta} style={{ marginTop: 6 }}>
                    {dayjs(log.created_at).format("MMM D, YYYY h:mm:ss A")}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Spin>
    </div>
  );
}
