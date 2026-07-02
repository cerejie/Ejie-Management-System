import { useState } from "react";
import { Avatar, Tag, Button, Empty, Spin } from "antd";
import { UserAddOutlined, DownOutlined, CheckOutlined, SwapOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Profile } from "@/types/database";
import { listWrap, listItem, row, body, title, meta, right, chevron, chevronOpen, actions, emptyWrap } from "@/styles/rowList.css";

interface EmployeeCardListProps {
  profiles: Profile[];
  loading?: boolean;
  currentProfileId?: string;
  onApprove: (row: Profile) => void;
  onToggleRole: (row: Profile) => void;
  onRemove: (row: Profile) => void;
}

export function EmployeeCardList({
  profiles,
  loading,
  currentProfileId,
  onApprove,
  onToggleRole,
  onRemove,
}: EmployeeCardListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={listWrap}>
      {profiles.length === 0 && !loading && (
        <div className={emptyWrap}>
          <Empty image={<UserAddOutlined style={{ fontSize: 40, color: "#D8DAE5" }} />} description="No employees found" />
        </div>
      )}
      <Spin spinning={Boolean(loading)}>
        {profiles.map((profile) => {
          const isSelf = profile.id === currentProfileId;
          const isExpanded = expandedId === profile.id;
          return (
            <div key={profile.id} className={listItem}>
              <div className={row} onClick={() => !isSelf && setExpandedId(isExpanded ? null : profile.id)}>
                <Avatar size={34} style={{ backgroundColor: "#4F46E5", fontSize: 13, flexShrink: 0 }}>
                  {profile.username[0]?.toUpperCase()}
                </Avatar>
                <div className={body}>
                  <div className={title}>{profile.full_name || profile.username}</div>
                  <div className={meta}>
                    @{profile.username} · Joined {dayjs(profile.created_at).format("MMM D, YYYY")}
                  </div>
                </div>
                <div className={right}>
                  {profile.status === "pending" && (
                    <Tag color="orange" style={{ borderRadius: 6, margin: 0 }}>
                      pending
                    </Tag>
                  )}
                  <Tag color={profile.role === "admin" ? "gold" : "blue"} style={{ borderRadius: 6, margin: 0 }}>
                    {profile.role}
                  </Tag>
                  {!isSelf && <DownOutlined className={`${chevron} ${isExpanded ? chevronOpen : ""}`} />}
                </div>
              </div>
              {!isSelf && isExpanded && (
                <div className={actions} onClick={(e) => e.stopPropagation()}>
                  {profile.status === "pending" && (
                    <Button size="small" icon={<CheckOutlined />} onClick={() => onApprove(profile)}>
                      Approve
                    </Button>
                  )}
                  <Button size="small" icon={<SwapOutlined />} onClick={() => onToggleRole(profile)}>
                    {profile.role === "admin" ? "Demote" : "Promote"}
                  </Button>
                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onRemove(profile)}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </Spin>
    </div>
  );
}
