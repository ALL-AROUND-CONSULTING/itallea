import { useState } from "react";
import { Home, Database, Plus, Settings, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { WeighingModal } from "@/components/weighing/WeighingModal";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/my-products", icon: Database, label: "Database" },
  { type: "fab" as const },
  { to: "/charts", icon: Settings, label: "Impostazioni" },
  { to: "/profile", icon: User, label: "Profilo" },
];

export function BottomNav() {
  const location = useLocation();
  const [weighingOpen, setWeighingOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
          {navItems.map((item, idx) => {
            if ("type" in item && item.type === "fab") {
              return (
                <button
                  key="fab"
                  onClick={() => setWeighingOpen(true)}
                  className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
                  style={{ background: "hsl(var(--brand-blue))" }}
                  aria-label="Nuova pesata"
                >
                  <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
                </button>
              );
            }

            const { to, icon: Icon, label } = item as {
              to: string;
              icon: typeof Home;
              label: string;
            };
            const isActive =
              to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-[hsl(var(--brand-blue))]"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
      <WeighingModal open={weighingOpen} onOpenChange={setWeighingOpen} />
    </>
  );
}
