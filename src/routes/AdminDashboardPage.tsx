import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Typography, Modal, DatePicker, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
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
import { page, pageHeader, pageTitle, pageSubtitle, toolbar, toolbarField } from "@/styles/layout.css";

const { RangePicker } = DatePicker;

export function AdminDashboardPage() {
  const { message } = App.useApp();
  const [transactions, setTransactions] = useState<TransactionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TransactionWithAuthor | null>(null);
  const [saving, setSaving] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTransactions(await listAllTransactions());
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    load();
  }, [load]);

  // Already sorted latest-first by the API query; filtering preserves that order.
  const filtered = useMemo(() => {
    let rows = transactions;
    if (dateRange) {
      const [start, end] = dateRange;
      rows = rows.filter((tx) => {
        const created = dayjs(tx.created_at);
        return created.isAfter(start.startOf("day")) && created.isBefore(end.endOf("day"));
      });
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (tx) =>
          tx.note?.toLowerCase().includes(q) || tx.profiles?.username?.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [transactions, dateRange, search]);

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
        <div className={pageHeader}>
          <div>
            <Typography.Title level={3} className={pageTitle}>
              Dashboard
            </Typography.Title>
            <p className={pageSubtitle}>Company-wide view of every recorded transaction.</p>
          </div>
        </div>

        <StatCardRow balanceLabel="Current balance" totalIn={totals.totalIn} totalOut={totals.totalOut} net={totals.net} />

        <div className={toolbar} style={{ marginTop: 24 }}>
          <Input
            allowClear
            placeholder="Search by note or employee"
            prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={toolbarField}
          />
          <RangePicker
            className={toolbarField}
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
