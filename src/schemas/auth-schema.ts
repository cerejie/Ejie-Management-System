import { z } from "zod";

const username = z
  .string()
  .min(3, "At least 3 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Letters, numbers, underscore, or period only");

const password = z.string().min(6, "Password must be at least 6 characters");

export const loginSchema = z.object({
  username,
  password,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  username,
  password,
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const createEmployeeSchema = z.object({
  username,
  password,
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
