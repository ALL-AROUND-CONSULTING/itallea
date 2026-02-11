import { useState } from "react";
import { Home, Database, Settings, User, Plus } from "lucide-react";
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
          {navItems.map((item, idx) => {
            if ("type" in item && item.type === "fab") {
              return (
                <button
                  key="fab"
                  onClick={() => setWeighingOpen(true)}
                  className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
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
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isActive && "scale-110"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
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
