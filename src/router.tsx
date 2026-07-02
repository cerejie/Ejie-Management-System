import { createRootRoute, createRoute, createRouter, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { LoginPage } from "@/routes/LoginPage";
import { RegisterPage } from "@/routes/RegisterPage";
import { TransactionsPage } from "@/routes/TransactionsPage";
import { AdminDashboardPage } from "@/routes/AdminDashboardPage";
import { EmployeesPage } from "@/routes/EmployeesPage";
import { LogsPage } from "@/routes/LogsPage";

const rootRoute = createRootRoute({
  component: Outlet,
});

function requireGuest() {
  if (useAuthStore.getState().status === "signed-in") {
    throw redirect({ to: "/" });
  }
}

function requireAuth() {
  if (useAuthStore.getState().status !== "signed-in") {
    throw redirect({ to: "/login" });
  }
}

function requireAdmin() {
  requireAuth();
  if (useAuthStore.getState().profile?.role !== "admin") {
    throw redirect({ to: "/transactions" });
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    requireAuth();
    const profile = useAuthStore.getState().profile;
    throw redirect({ to: profile?.role === "admin" ? "/admin" : "/transactions" });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: requireGuest,
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: requireGuest,
  component: RegisterPage,
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/transactions",
  beforeLoad: requireAuth,
  component: TransactionsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: requireAdmin,
  component: AdminDashboardPage,
});

const adminEmployeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/employees",
  beforeLoad: requireAdmin,
  component: EmployeesPage,
});

const adminLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/logs",
  beforeLoad: requireAdmin,
  component: LogsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  transactionsRoute,
  adminRoute,
  adminEmployeesRoute,
  adminLogsRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
