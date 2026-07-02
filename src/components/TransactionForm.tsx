import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, InputNumber, Segmented } from "antd";
import {
  transactionSchema,
  type TransactionFormValues,
} from "@/schemas/transaction-schema";

interface TransactionFormProps {
  initialValues?: TransactionFormValues;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: TransactionFormValues) => Promise<void> | void;
}

const defaultValues: TransactionFormValues = {
  type: "deposit",
  amount: 0,
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
    <Form layout="vertical" onFinish={handleSubmit(submit)}>
      <Form.Item label="Type" validateStatus={errors.type ? "error" : ""} help={errors.type?.message}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Segmented
              {...field}
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
              style={{ width: "100%" }}
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
