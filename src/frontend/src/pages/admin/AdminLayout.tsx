import { cn } from "@/lib/utils";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { ClipboardList, LayoutDashboard, PlusCircle } from "lucide-react";
import { AdminGuard } from "../../components/AdminGuard";

const navLinks = [
  {
    to: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    to: "/admin/tournaments/new",
    label: "Create Tournament",
    icon: PlusCircle,
    exact: false,
  },
  {
    to: "/admin/registrations",
    label: "Registrations",
    icon: ClipboardList,
    exact: false,
  },
];

export function AdminLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <AdminGuard>
      <div data-ocid="admin.page" className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-black gradient-text-gaming mb-1">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage tournaments and player registrations
          </p>
        </div>

        {/* Admin Nav */}
        <nav className="flex flex-wrap gap-2 mb-8 p-1 bg-gaming-surface-1 rounded-xl border border-border">
          {navLinks.map((link) => {
            const isActive = link.exact
              ? currentPath === link.to
              : currentPath.startsWith(link.to);
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={
                  link.to === "/admin/tournaments/new"
                    ? "admin.create_tournament.button"
                    : link.to === "/admin/registrations"
                      ? "admin.registrations.tab"
                      : "admin.dashboard.link"
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-glow-green"
                    : "text-muted-foreground hover:text-foreground hover:bg-gaming-surface-2",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Content */}
        <Outlet />
      </div>
    </AdminGuard>
  );
}
