import { useCallback, useEffect, useMemo, useState } from "react";
import { App, Typography, Row, Col, Modal, DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { AppLayout } from "@/components/AppLayout";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import { StatCardRow } from "@/components/StatCardRow";
import { useAuthStore } from "@/store/auth-store";
import { computeTotals, createTransaction, listOwnTransactions, updateTransaction } from "@/lib/api";
import type { Transaction } from "@/types/database";
import { page, pageHeader, pageTitle, pageSubtitle, card } from "@/styles/layout.css";
import type { TransactionFormValues } from "@/schemas/transaction-schema";

const { RangePicker } = DatePicker;

export function TransactionsPage() {
  const { message } = App.useApp();
  const profile = useAuthStore((s) => s.profile);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      setTransactions(await listOwnTransactions(profile.id));
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [profile, message]);

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

  const totals = computeTotals(filtered);

  async function handleSubmit(values: TransactionFormValues) {
    if (!profile) return;
    setSubmitting(true);
    try {
      await createTransaction({ ...values, createdBy: profile.id });
      message.success("Entry recorded");
      await load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Failed to save entry");
    } finally {
      setSubmitting(false);
    }
  }

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

  return (
    <AppLayout>
      <div className={page}>
        <div className={pageHeader}>
          <div>
            <Typography.Title level={3} className={pageTitle}>
              My Ledger
            </Typography.Title>
            <p className={pageSubtitle}>Track the money you've recorded in and out.</p>
          </div>
        </div>

        <StatCardRow balanceLabel="My balance" totalIn={totals.totalIn} totalOut={totals.totalOut} net={totals.net} />

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24} md={8}>
            <div className={card} style={{ marginBottom: 0 }}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Record an entry
              </Typography.Title>
              <TransactionForm submitLabel="Add entry" submitting={submitting} onSubmit={handleSubmit} />
            </div>
          </Col>
          <Col xs={24} md={16}>
            <div style={{ marginBottom: 16 }}>
              <RangePicker
                value={dateRange}
                onChange={(value) => setDateRange(value && value[0] && value[1] ? [value[0], value[1]] : null)}
                allowClear
              />
            </div>
            <TransactionTable data={filtered} loading={loading} onEdit={setEditing} />
          </Col>
        </Row>
      </div>

      <Modal title="Edit entry" open={Boolean(editing)} onCancel={() => setEditing(null)} footer={null} destroyOnHidden>
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
