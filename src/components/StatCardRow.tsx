import { Row, Col } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined } from "@ant-design/icons";
import { vars } from "@/styles/theme.css";
import { tile, iconBadge, body, label, value } from "@/styles/statTile.css";

function StatTile({
  icon,
  iconColor,
  iconBg,
  label: labelText,
  amount,
}: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  amount: number;
}) {
  return (
    <div className={tile}>
      <div className={iconBadge} style={{ color: iconColor, background: iconBg }}>
        {icon}
      </div>
      <div className={body}>
        <div className={label}>{labelText}</div>
        <div className={value} style={{ color: amount < 0 ? vars.color.negative : vars.color.text }}>
          {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}

export function StatCardRow({
  balanceLabel,
  totalIn,
  totalOut,
  net,
}: {
  balanceLabel: string;
  totalIn: number;
  totalOut: number;
  net: number;
}) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={8}>
        <StatTile
          icon={<WalletOutlined />}
          iconColor={vars.color.brand}
          iconBg={vars.color.brandSoft}
          label={balanceLabel}
          amount={net}
        />
      </Col>
      <Col xs={24} sm={8}>
        <StatTile
          icon={<ArrowUpOutlined />}
          iconColor={vars.color.positive}
          iconBg={vars.color.positiveSoft}
          label="Total money in"
          amount={totalIn}
        />
      </Col>
      <Col xs={24} sm={8}>
        <StatTile
          icon={<ArrowDownOutlined />}
          iconColor={vars.color.negative}
          iconBg={vars.color.negativeSoft}
          label="Total money out"
          amount={totalOut}
        />
      </Col>
    </Row>
  );
}
