import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { ActionBar } from "./ActionBar";
import { motion, AnimatePresence } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!isHome && <ActionBar />}
      <BottomNav />
    </div>
  );
}
