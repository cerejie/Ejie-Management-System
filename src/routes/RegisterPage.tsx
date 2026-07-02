import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Typography, Alert } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth-schema";
import { authScreen, authCard } from "@/styles/layout.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      // Email confirmation is enabled on the Supabase project.
      setError("Account created. Check your email to confirm before signing in.");
      return;
    }

    await useAuthStore.getState().hydrate(data.session);
    navigate({ to: "/" });
  }

  return (
    <div className={authScreen}>
      <div className={authCard}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Create account
        </Typography.Title>

        {error && <Alert type="info" message={error} style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Full name" validateStatus={errors.fullName ? "error" : ""} help={errors.fullName?.message}>
            <Controller control={control} name="fullName" render={({ field }) => <Input {...field} autoComplete="name" />} />
          </Form.Item>

          <Form.Item label="Email" validateStatus={errors.email ? "error" : ""} help={errors.email?.message}>
            <Controller control={control} name="email" render={({ field }) => <Input {...field} autoComplete="email" />} />
          </Form.Item>

          <Form.Item label="Password" validateStatus={errors.password ? "error" : ""} help={errors.password?.message}>
            <Controller
              control={control}
              name="password"
              render={({ field }) => <Input.Password {...field} autoComplete="new-password" />}
            />
          </Form.Item>

          <Form.Item
            label="Confirm password"
            validateStatus={errors.confirmPassword ? "error" : ""}
            help={errors.confirmPassword?.message}
          >
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field }) => <Input.Password {...field} autoComplete="new-password" />}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form>

        <Typography.Paragraph style={{ marginTop: 16, textAlign: "center" }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </Typography.Paragraph>
      </div>
    </div>
  );
}
