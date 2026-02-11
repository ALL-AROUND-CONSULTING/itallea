import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScanLine, Plus, BookOpen } from "lucide-react";
import { WeighingModal } from "@/components/weighing/WeighingModal";

export function ActionBar() {
  const navigate = useNavigate();
  const [weighingOpen, setWeighingOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-12 max-w-lg items-center justify-around px-4">
          <button
            onClick={() => navigate("/scan")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ScanLine className="h-4 w-4" />
            Scan
          </button>
          <button
            onClick={() => setWeighingOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Pesata
          </button>
          <button
            onClick={() => navigate("/diary")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <BookOpen className="h-4 w-4" />
            Diario
          </button>
        </div>
      </div>
      <WeighingModal open={weighingOpen} onOpenChange={setWeighingOpen} />
    </>
  );
}
