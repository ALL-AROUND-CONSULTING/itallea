import { useAuth } from "@/contexts/AuthContext";
import { ScanLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function HomeHeader() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const firstName = profile?.first_name || "Utente";
  const avatarUrl = profile?.avatar_url;
  const initials = (firstName[0] ?? "U").toUpperCase();

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden pb-4"
        style={{
          background:
            "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-2 pt-6 pb-3"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <span className="text-lg">🍽️</span>
          </div>
          <span
            className="text-2xl font-bold tracking-wide"
            style={{ color: "hsl(var(--brand-dark-blue))" }}
          >
            ITAL LEA
          </span>
        </motion.div>

        {/* Greeting row */}
        <motion.div
          className="flex items-center justify-between px-5 pb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white shadow"
              style={{ background: "hsl(var(--brand-blue))" }}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bentornato</p>
              <p className="text-base font-semibold text-foreground">
                Ciao {firstName}
              </p>
            </div>
          </div>
          <motion.button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm"
            aria-label="Scanner"
            onClick={() => navigate("/scan")}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
          >
            <ScanLine className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
