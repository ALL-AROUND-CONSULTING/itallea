import { useNavigate } from "react-router-dom";
import { Droplets, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useWaterLog } from "@/hooks/useWaterLog";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export function QuickCards() {
  const navigate = useNavigate();
  const { totalMl } = useWaterLog();
  const { profile } = useAuth();
  const goalMl = profile?.water_goal_ml ?? 2500;

  const formatted = (ml: number) =>
    ml >= 1000 ? `${(ml / 1000).toFixed(1).replace(".0", "")} L` : `${ml} ml`;

  return (
    <div className="mx-4 mb-6 mt-4 grid grid-cols-2 gap-3">
      {/* Hydration */}
      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
        <Card className="flex flex-col items-center gap-2 border-0 p-4 shadow-md">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "hsl(200, 90%, 92%)" }}
          >
            <Droplets className="h-6 w-6" style={{ color: "hsl(var(--brand-blue))" }} />
          </div>
          <p className="text-sm font-semibold text-foreground">Idratazione</p>
          <p className="text-lg font-bold text-foreground">{formatted(totalMl)}</p>
          <p className="text-[11px] text-muted-foreground">
            Obiettivo: {formatted(goalMl)}
          </p>
        </Card>
      </motion.div>

      {/* Database */}
      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
        <Card
          className="flex cursor-pointer flex-col items-center gap-2 border-0 p-4 shadow-md"
          onClick={() => navigate("/my-products")}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "hsl(24, 80%, 93%)" }}
          >
            <UtensilsCrossed className="h-6 w-6 text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">Il mio database</p>
          <p className="text-center text-[11px] text-muted-foreground">
            Aggiungi ricetta o alimento
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
