import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, InputNumber, Segmented } from "antd";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/schemas/transaction-schema";
import { segmentedTypeControl } from "@/styles/layout.css";

interface TransactionFormProps {
  initialValues?: TransactionFormValues;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: TransactionFormValues) => Promise<void> | void;
}

const defaultValues: TransactionFormValues = {
  type: "deposit",
  amount: undefined as unknown as number,
  note: "",
};

export function TransactionForm({
  initialValues,
  submitLabel = "Save",
  submitting,
  onSubmit,
}: TransactionFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialValues ?? defaultValues,
  });

  useEffect(() => {
    reset(initialValues ?? defaultValues);
  }, [initialValues, reset]);

  async function submit(values: TransactionFormValues) {
    await onSubmit(values);
    if (!initialValues) reset(defaultValues);
  }

  return (
    <Form layout="vertical" requiredMark="optional" onFinish={handleSubmit(submit)}>
      <Form.Item label="Type" validateStatus={errors.type ? "error" : ""} help={errors.type?.message}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Segmented
              {...field}
              block
              className={`${segmentedTypeControl} ${field.value === "deposit" ? "deposit" : "deduction"}`}
              options={[
                { label: "Money In", value: "deposit" },
                { label: "Money Out", value: "deduction" },
              ]}
            />
          )}
        />
      </Form.Item>

      <Form.Item label="Amount" validateStatus={errors.amount ? "error" : ""} help={errors.amount?.message}>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <InputNumber
              {...field}
              min={0}
              step={0.01}
              precision={2}
              placeholder="0.00"
              style={{ width: "100%" }}
              formatter={(value, info) => {
                // antd passes "" (not undefined) for an empty field despite its number-only type
                const raw = value as number | string | undefined;
                if (raw === undefined || raw === null || raw === "") return "";
                return info.userTyping ? String(raw) : Number(raw).toFixed(2);
              }}
              onPressEnter={(e) => (e.currentTarget as HTMLInputElement).blur()}
            />
          )}
        />
      </Form.Item>

      <Form.Item label="Note" validateStatus={errors.note ? "error" : ""} help={errors.note?.message}>
        <Controller
          control={control}
          name="note"
          render={({ field }) => (
            <Input.TextArea {...field} rows={3} placeholder="What is this for? (optional)" />
          )}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={submitting} block>
        {submitLabel}
      </Button>
    </Form>
  );
}
