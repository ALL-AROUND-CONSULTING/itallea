import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ScanLine, Droplets, Weight } from "lucide-react";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { WeighingModal } from "@/components/weighing/WeighingModal";
import { useWaterLog } from "@/hooks/useWaterLog";
import { useWeightLog } from "@/hooks/useWeightLog";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickActionSheet({ open, onOpenChange }: QuickActionSheetProps) {
  const navigate = useNavigate();
  const [weighingOpen, setWeighingOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [weightValue, setWeightValue] = useState("");
  const { addGlass } = useWaterLog();
  const { logWeight } = useWeightLog();

  const handleFood = () => {
    onOpenChange(false);
    setTimeout(() => setWeighingOpen(true), 200);
  };

  const handleBarcode = () => {
    onOpenChange(false);
    navigate("/scan");
  };

  const handleWater = () => {
    onOpenChange(false);
    addGlass.mutate(250, {
      onSuccess: () => toast.success("💧 Bicchiere d'acqua aggiunto!"),
      onError: () => toast.error("Errore nell'aggiungere acqua"),
    });
  };

  const handleWeight = () => {
    onOpenChange(false);
    setTimeout(() => setWeightDialogOpen(true), 200);
  };

  const saveWeight = () => {
    const kg = parseFloat(weightValue);
    if (isNaN(kg) || kg <= 0) return;
    logWeight.mutate(kg, {
      onSuccess: () => {
        toast.success("⚖️ Peso registrato!");
        setWeightDialogOpen(false);
        setWeightValue("");
      },
      onError: () => toast.error("Errore nel salvare il peso"),
    });
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="mx-auto max-w-lg px-4 pb-8">
          {/* Two main cards */}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button
              onClick={handleFood}
              className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 transition-transform active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "hsl(var(--brand-blue))" }}>
                <Search className="h-7 w-7 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">Registra alimento</span>
            </button>

            <button
              onClick={handleBarcode}
              className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 transition-transform active:scale-95"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "hsl(var(--brand-blue))" }}>
                <ScanLine className="h-7 w-7 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">Scansiona barcode</span>
            </button>
          </div>

          {/* List items */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleWater}
              className="flex w-full items-center gap-4 rounded-2xl border bg-card px-4 py-3.5 transition-transform active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Droplets className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Acqua (+250ml)</span>
            </button>

            <button
              onClick={handleWeight}
              className="flex w-full items-center gap-4 rounded-2xl border bg-card px-4 py-3.5 transition-transform active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Weight className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-foreground">Peso corporeo</span>
            </button>
          </div>
        </DrawerContent>
      </Drawer>

      <WeighingModal open={weighingOpen} onOpenChange={setWeighingOpen} />

      <Dialog open={weightDialogOpen} onOpenChange={setWeightDialogOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>⚖️ Registra peso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="Es. 75.5"
              value={weightValue}
              onChange={(e) => setWeightValue(e.target.value)}
              autoFocus
            />
            <Button className="w-full" onClick={saveWeight} disabled={!weightValue || logWeight.isPending}>
              {logWeight.isPending ? "Salvataggio…" : "Salva"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
