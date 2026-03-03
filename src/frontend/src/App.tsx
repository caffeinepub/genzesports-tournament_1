import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HomePage } from "./pages/HomePage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { CreateTournamentPage } from "./pages/admin/CreateTournamentPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { RegistrationsPage } from "./pages/admin/RegistrationsPage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast:
              "bg-gaming-surface-2 border-border text-foreground font-body",
            success: "border-primary/30",
            error: "border-destructive/30",
          },
        }}
      />
    </div>
  ),
});

// Home route
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Register route
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tournament/$id/register",
  component: RegisterPage,
});

// Admin parent route (layout with AdminGuard)
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

// Admin dashboard (index)
const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/",
  component: DashboardPage,
});

// Create tournament
const adminCreateTournamentRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/tournaments/new",
  component: CreateTournamentPage,
});

// Registrations
const adminRegistrationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/registrations",
  component: RegistrationsPage,
});

// Catch-all redirect to home
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  registerRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminCreateTournamentRoute,
    adminRegistrationsRoute,
  ]),
  catchAllRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
