import { supabase } from "@/lib/supabase";
import type { Profile, Transaction, TransactionWithAuthor } from "@/types/database";

export async function listOwnTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function listAllTransactions(): Promise<TransactionWithAuthor[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, profiles(id, full_name, email)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as TransactionWithAuthor[];
}

export async function createTransaction(input: {
  type: "deposit" | "deduction";
  amount: number;
  note?: string;
  createdBy: string;
}): Promise<void> {
  const { error } = await supabase.from("transactions").insert({
    type: input.type,
    amount: input.amount,
    note: input.note ?? null,
    created_by: input.createdBy,
  });

  if (error) throw error;
}

export async function updateTransaction(
  id: string,
  changes: { type: "deposit" | "deduction"; amount: number; note?: string },
): Promise<void> {
  const { error } = await supabase
    .from("transactions")
    .update({
      type: changes.type,
      amount: changes.amount,
      note: changes.note ?? null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function setProfileRole(id: string, role: "admin" | "employee"): Promise<void> {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

export function computeBalance(transactions: Transaction[]): number {
  return transactions.reduce(
    (total, tx) => total + (tx.type === "deposit" ? tx.amount : -tx.amount),
    0,
  );
}
