import { Outlet, NavLink, Navigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Users, Bell, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const navItems = [
  { to: "/admin/users", label: "Utenti", icon: Users },
  { to: "/admin/notifications", label: "Notifiche", icon: Bell },
  { to: "/admin/products", label: "Alimenti", icon: Package },
];

export default function AdminLayout() {
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center gap-3 border-b bg-card px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Admin</h1>
      </header>

      {/* Tab nav */}
      <nav className="flex border-b bg-card">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
