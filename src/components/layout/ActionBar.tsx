import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, Plus, BookOpen } from "lucide-react";
import { WeighingModal } from "@/components/weighing/WeighingModal";
import { motion } from "framer-motion";

export function ActionBar() {
  const navigate = useNavigate();
  const [weighingOpen, setWeighingOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-12 max-w-lg items-center justify-around px-4">
          <motion.button
            onClick={() => navigate("/scan")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            whileTap={{ scale: 0.92 }}
          >
            <ScanLine className="h-4 w-4" />
            Scan
          </motion.button>
          <motion.button
            onClick={() => setWeighingOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Plus className="h-4 w-4" />
            Pesata
          </motion.button>
          <motion.button
            onClick={() => navigate("/diary")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            whileTap={{ scale: 0.92 }}
          >
            <BookOpen className="h-4 w-4" />
            Diario
          </motion.button>
        </div>
      </div>
      <WeighingModal open={weighingOpen} onOpenChange={setWeighingOpen} />
    </>
  );
}
