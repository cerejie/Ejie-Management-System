import { useCallback, useEffect, useState } from "react";
import { Typography, message, Row, Col, Modal } from "antd";
import { AppLayout } from "@/components/AppLayout";
import { BalanceCard } from "@/components/BalanceCard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionTable } from "@/components/TransactionTable";
import {
  computeBalance,
  deleteTransaction,
  listAllTransactions,
  updateTransaction,
} from "@/lib/api";
import type { TransactionWithAuthor } from "@/types/database";
import type { TransactionFormValues } from "@/schemas/transaction-schema";
import { page } from "@/styles/layout.css";

export function AdminDashboardPage() {
  const [transactions, setTransactions] = useState<TransactionWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TransactionWithAuthor | null>(null);
  const [saving, setSaving] = useState(false);

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

  const balance = computeBalance(transactions);

  return (
    <AppLayout>
      <div className={page}>
        <Typography.Title level={3}>Dashboard</Typography.Title>
        <Row gutter={24}>
          <Col xs={24} md={8}>
            <BalanceCard label="Current balance" value={balance} />
          </Col>
        </Row>

        <TransactionTable
          data={transactions}
          loading={loading}
          onEdit={setEditing}
          onDelete={handleDelete}
        />
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
