import { useState } from "react";
import { Home, Database, Settings, User, Plus } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { WeighingModal } from "@/components/weighing/WeighingModal";
import { motion } from "framer-motion";

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
                <motion.button
                  key="fab"
                  onClick={() => setWeighingOpen(true)}
                  className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
                  style={{ background: "hsl(var(--brand-blue))" }}
                  aria-label="Nuova pesata"
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
                </motion.button>
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
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <motion.div
                  animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </motion.div>
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1.5 h-0.5 w-4 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
      <WeighingModal open={weighingOpen} onOpenChange={setWeighingOpen} />
    </>
  );
}
