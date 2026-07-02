import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["deposit", "deduction"]),
  amount: z
    .number({ error: "Enter an amount" })
    .positive("Amount must be greater than 0"),
  note: z.string().max(280, "Keep the note under 280 characters").optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
