import { Statistic } from "antd";
import { card } from "@/styles/layout.css";

export function BalanceCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={card}>
      <Statistic
        title={label}
        value={value}
        precision={2}
        valueStyle={{ color: value >= 0 ? "#389e0d" : "#cf1322" }}
      />
    </div>
  );
}
