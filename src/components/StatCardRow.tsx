import { Row, Col, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, WalletOutlined } from "@ant-design/icons";
import { card } from "@/styles/layout.css";
import { vars } from "@/styles/theme.css";

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
    <Row gutter={16}>
      <Col xs={24} sm={8}>
        <div className={card}>
          <Statistic
            title={balanceLabel}
            value={net}
            precision={2}
            prefix={<WalletOutlined />}
            valueStyle={{
              color: net >= 0 ? vars.color.positive : vars.color.negative,
              fontWeight: 600,
            }}
          />
        </div>
      </Col>
      <Col xs={24} sm={8}>
        <div className={card}>
          <Statistic
            title="Total money in"
            value={totalIn}
            precision={2}
            prefix={<ArrowUpOutlined />}
            valueStyle={{ color: vars.color.positive, fontWeight: 600 }}
          />
        </div>
      </Col>
      <Col xs={24} sm={8}>
        <div className={card}>
          <Statistic
            title="Total money out"
            value={totalOut}
            precision={2}
            prefix={<ArrowDownOutlined />}
            valueStyle={{ color: vars.color.negative, fontWeight: 600 }}
          />
        </div>
      </Col>
    </Row>
  );
}
