import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Typography, Alert } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { usernameToEmail } from "@/lib/auth-helpers";
import { loginSchema, type LoginFormValues } from "@/schemas/auth-schema";
import { authScreen, authBrand, authBrandMark, authCard, authFooterText } from "@/styles/layout.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(values.username),
      password: values.password,
    });
    setLoading(false);

    if (error || !data.session) {
      setError(error?.message === "Invalid login credentials" ? "Wrong username or password" : (error?.message ?? "Sign in failed"));
      return;
    }

    await useAuthStore.getState().hydrate(data.session);
    const profile = useAuthStore.getState().profile;

    if (profile?.status !== "approved") {
      await useAuthStore.getState().signOut();
      setError("Your account hasn't been approved by an admin yet.");
      return;
    }

    navigate({ to: "/" });
  }

  return (
    <div className={authScreen}>
      <div className={authBrand}>
        <div className={authBrandMark}>EJ</div>
          Ejie Layouts Monitoring
      </div>
      <div className={authCard}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Welcome back
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: -8, marginBottom: 24 }}>
          Sign in to continue to your account.
        </Typography.Paragraph>

        {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} showIcon />}

        <Form layout="vertical" requiredMark="optional" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Username" validateStatus={errors.username ? "error" : ""} help={errors.username?.message}>
            <Controller control={control} name="username" render={({ field }) => <Input {...field} autoComplete="username" />} />
          </Form.Item>

          <Form.Item label="Password" validateStatus={errors.password ? "error" : ""} help={errors.password?.message}>
            <Controller
              control={control}
              name="password"
              render={({ field }) => <Input.Password {...field} autoComplete="current-password" />}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign in
          </Button>
        </Form>

        <p className={authFooterText}>
          No account yet? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
