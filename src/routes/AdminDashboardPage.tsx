import { useCallback, useEffect, useMemo, useState } from "react";
import { Typography, message, Modal, DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { AppLayout } from "@/components/AppLayout";
import { StatCardRow } from "@/components/StatCardRow";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import {
  computeTotals,
  deleteTransaction,
  listAllTransactions,
  updateTransaction,
} from "@/lib/api";
import type { TransactionWithAuthor } from "@/types/database";
import type { TransactionFormValues } from "@/schemas/transaction-schema";
import { page } from "@/styles/layout.css";

const { RangePicker } = DatePicker;

export function AdminDashboardPage() {
  const [transactions, setTransactions] = useState<TransactionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TransactionWithAuthor | null>(null);
  const [saving, setSaving] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTransactions(await listAllTransactions());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Already sorted latest-first by the API query; filtering preserves that order.
  const filtered = useMemo(() => {
    if (!dateRange) return transactions;
    const [start, end] = dateRange;
    return transactions.filter((tx) => {
      const created = dayjs(tx.created_at);
      return created.isAfter(start.startOf("day")) && created.isBefore(end.endOf("day"));
    });
  }, [transactions, dateRange]);

  async function handleUpdate(values: TransactionFormValues) {
    if (!editing) return;
    setSaving(true);
    try {
      await updateTransaction(editing.id, values);
      message.success("Entry updated");
      setEditing(null);
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to update entry");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: TransactionWithAuthor) {
    try {
      await deleteTransaction(row.id);
      message.success("Entry deleted");
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to delete entry");
    }
  }

  const totals = computeTotals(filtered);

  return (
    <AppLayout>
      <div className={page}>
        <Typography.Title level={3}>Dashboard</Typography.Title>

        <StatCardRow balanceLabel="Current balance" totalIn={totals.totalIn} totalOut={totals.totalOut} net={totals.net} />

        <div style={{ margin: "24px 0 16px" }}>
          <RangePicker
            value={dateRange}
            onChange={(value) => setDateRange(value && value[0] && value[1] ? [value[0], value[1]] : null)}
            allowClear
          />
        </div>

        <TransactionTable data={filtered} loading={loading} onEdit={setEditing} onDelete={handleDelete} />
      </div>

      <Modal
        title="Edit entry"
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        footer={null}
        destroyOnHidden
      >
        {editing && (
          <TransactionForm
            initialValues={{
              type: editing.type,
              amount: editing.amount,
              note: editing.note ?? "",
            }}
            submitLabel="Save changes"
            submitting={saving}
            onSubmit={handleUpdate}
          />
        )}
      </Modal>
    </AppLayout>
  );
}
