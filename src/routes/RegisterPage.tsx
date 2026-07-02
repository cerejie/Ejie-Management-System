import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, Input, Typography, Alert, Result } from "antd";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";
import { usernameToEmail } from "@/lib/auth-helpers";
import { registerEmployee } from "@/lib/api";
import { registerSchema, type RegisterFormValues } from "@/schemas/auth-schema";
import { authScreen, authBrand, authBrandMark, authCard, authFooterText } from "@/styles/layout.css";

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredUsername, setRegisteredUsername] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", username: "", password: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    setLoading(true);
    setError(null);

    try {
      // Goes through a server-side function that uses the Admin API, so
      // Supabase never tries to send a confirmation email — no rate limits,
      // no "confirm email" dependency. The account starts out pending, so we
      // don't sign in automatically here — sign-in itself rejects unapproved
      // accounts, see LoginPage. The one exception is the very first account
      // ever created, which is auto-approved as admin (system bootstrap) —
      // in that case we do sign in immediately since there's no one to wait on.
      const { status } = await registerEmployee(values);

      if (status === "approved") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: usernameToEmail(values.username),
          password: values.password,
        });
        if (!error && data.session) {
          await useAuthStore.getState().hydrate(data.session);
          navigate({ to: "/" });
          return;
        }
      }

      setRegisteredUsername(values.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  if (registeredUsername) {
    return (
      <div className={authScreen}>
        <div className={authBrand}>
          <div className={authBrandMark}>EJ</div>
          Ejie Layouts Monitoring
        </div>
        <div className={authCard}>
          <Result
            status="success"
            title="Account created"
            subTitle={
              <>
                Your account (<strong>{registeredUsername}</strong>) is waiting for an admin to
                approve it. You'll be able to sign in once that happens.
              </>
            }
            style={{ padding: "24px 0" }}
          />
          <Link to="/login">
            <Button type="primary" block>
              Go to sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={authScreen}>
      <div className={authBrand}>
        <div className={authBrandMark}>EJ</div>
          Ejie Layouts Monitoring
      </div>
      <div className={authCard}>
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          Create account
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginTop: -8, marginBottom: 24 }}>
          Register to request access to the ledger.
        </Typography.Paragraph>

        {error && <Alert type="error" title={error} style={{ marginBottom: 16 }} showIcon />}

        <Form layout="vertical" requiredMark="optional" onFinish={handleSubmit(onSubmit)}>
          <Form.Item label="Name" validateStatus={errors.fullName ? "error" : ""} help={errors.fullName?.message}>
            <Controller control={control} name="fullName" render={({ field }) => <Input {...field} autoComplete="name" />} />
          </Form.Item>

          <Form.Item label="Username" validateStatus={errors.username ? "error" : ""} help={errors.username?.message}>
            <Controller control={control} name="username" render={({ field }) => <Input {...field} autoComplete="username" />} />
          </Form.Item>

          <Form.Item label="Password" validateStatus={errors.password ? "error" : ""} help={errors.password?.message}>
            <Controller
              control={control}
              name="password"
              render={({ field }) => <Input.Password {...field} autoComplete="new-password" />}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading} block>
            Register
          </Button>
        </Form>

        <p className={authFooterText}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
