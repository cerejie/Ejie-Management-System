import { useCallback, useEffect, useState } from "react";
import { Typography, message, Row, Col } from "antd";
import { AppLayout } from "@/components/AppLayout";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import { useAuthStore } from "@/store/auth-store";
import { createTransaction, listOwnTransactions } from "@/lib/api";
import type { Transaction } from "@/types/database";
import { page, card } from "@/styles/layout.css";
import type { TransactionFormValues } from "@/schemas/transaction-schema";

export function TransactionsPage() {
  const profile = useAuthStore((s) => s.profile);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

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

  return (
    <AppLayout>
      <div className={page}>
        <Typography.Title level={3}>My Ledger</Typography.Title>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <div className={card}>
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Record an entry
              </Typography.Title>
              <TransactionForm submitLabel="Add entry" submitting={submitting} onSubmit={handleSubmit} />
            </div>
          </Col>
          <Col xs={24} md={16}>
            <TransactionTable data={transactions} loading={loading} />
          </Col>
        </Row>
      </div>
    </AppLayout>
  );
}
