import { supabase } from "@/lib/supabase";
import type { ActivityLogWithActor, Profile, Transaction, TransactionWithAuthor } from "@/types/database";

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
    .select("*, profiles(id, username)")
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

export async function approveProfile(id: string): Promise<void> {
  const { error } = await supabase.from("profiles").update({ status: "approved" }).eq("id", id);
  if (error) throw error;
}

async function invokeFunction<T extends { error?: string }>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { error, data } = await supabase.functions.invoke<T>(name, { body });

  if (error) {
    // FunctionsHttpError carries the raw Response on `context`; the actual
    // message lives in the JSON body our function returns, not error.message.
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      const errorBody = await context.json().catch(() => null);
      throw new Error(errorBody?.error ?? error.message);
    }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export async function registerEmployee(input: {
  fullName: string;
  username: string;
  password: string;
}): Promise<{ status: "pending" | "approved" }> {
  return invokeFunction<{ error?: string; status: "pending" | "approved" }>("register-employee", input);
}

export async function createEmployeeAccount(input: {
  username: string;
  password: string;
}): Promise<void> {
  await invokeFunction("create-employee", input);
}

export async function deleteEmployeeAccount(userId: string): Promise<void> {
  await invokeFunction("delete-employee", { userId });
}

export async function listActivityLogs(): Promise<ActivityLogWithActor[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, profiles(id, username)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;
  return data as ActivityLogWithActor[];
}

export function computeTotals(transactions: Transaction[]): {
  totalIn: number;
  totalOut: number;
  net: number;
} {
  const totalIn = transactions.filter((tx) => tx.type === "deposit").reduce((sum, tx) => sum + tx.amount, 0);
  const totalOut = transactions.filter((tx) => tx.type === "deduction").reduce((sum, tx) => sum + tx.amount, 0);
  return { totalIn, totalOut, net: totalIn - totalOut };
}
