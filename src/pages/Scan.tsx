import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronLeft, Zap, PenSquare, Image, Loader2 } from "lucide-react";

type ScannedProduct = {
  id: string;
  name: string;
  brand: string | null;
  barcode: string | null;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  salt_per_100g: number;
  image_url: string | null;
  source: string;
};

const Scan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lookupSource, setLookupSource] = useState("");

  const [grams, setGrams] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);

  // Auto-start scanner on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!scanning && !product && !loading && !notFound && !showManual) {
        startScanner();
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScannerRunning.current) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
          isScannerRunning.current = false;
        }).catch(() => {
          try { scannerRef.current?.clear(); } catch {}
          scannerRef.current = null;
          isScannerRunning.current = false;
        });
      } else {
        try { scannerRef.current?.clear(); } catch {}
        scannerRef.current = null;
        isScannerRunning.current = false;
      }
    };
  }, []);

  const lookupBarcode = useCallback(async (code: string) => {
    setLoading(true);
    setProduct(null);
    setNotFound(false);
    setGrams("");

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;
      if (!token) {
        toast.error("Devi essere autenticato");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/lookup-barcode?code=${encodeURIComponent(code)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const data = await res.json();

      if (data.found && data.product) {
        setProduct({
          ...data.product,
          kcal_per_100g: Number(data.product.kcal_per_100g),
          protein_per_100g: Number(data.product.protein_per_100g),
          carbs_per_100g: Number(data.product.carbs_per_100g),
          fat_per_100g: Number(data.product.fat_per_100g),
          fiber_per_100g: Number(data.product.fiber_per_100g ?? 0),
          salt_per_100g: Number(data.product.salt_per_100g ?? 0),
        });
        setLookupSource(data.source);
      } else {
        setNotFound(true);
      }
    } catch {
      toast.error("Errore nella ricerca del prodotto");
    } finally {
      setLoading(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current || isScannerRunning.current) return;

    try {
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
        },
        (decodedText) => {
          isScannerRunning.current = false;
          scanner.stop().then(() => {
            scanner.clear();
            scannerRef.current = null;
            setScanning(false);
            lookupBarcode(decodedText);
          }).catch(() => {
            try { scanner.clear(); } catch {}
            scannerRef.current = null;
            setScanning(false);
            lookupBarcode(decodedText);
          });
        },
        () => {}
      );

      isScannerRunning.current = true;
      setScanning(true);
    } catch {
      toast.error("Impossibile accedere alla fotocamera");
    }
  }, [lookupBarcode]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current && isScannerRunning.current) {
      isScannerRunning.current = false;
      scannerRef.current.stop().then(() => {
        try { scannerRef.current?.clear(); } catch {}
        scannerRef.current = null;
      }).catch(() => {
        try { scannerRef.current?.clear(); } catch {}
        scannerRef.current = null;
      });
    } else {
      try { scannerRef.current?.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (code.length < 4) {
      toast.error("Inserisci un codice valido");
      return;
    }
    setShowManual(false);
    lookupBarcode(code);
  };

  const preview = useMemo(() => {
    if (!product || !grams) return null;
    const g = parseFloat(grams);
    if (isNaN(g) || g <= 0) return null;
    const factor = g / 100;
    return {
      kcal: Math.round(product.kcal_per_100g * factor * 10) / 10,
      protein: Math.round(product.protein_per_100g * factor * 10) / 10,
      carbs: Math.round(product.carbs_per_100g * factor * 10) / 10,
      fat: Math.round(product.fat_per_100g * factor * 10) / 10,
    };
  }, [product, grams]);

  const handleSave = useCallback(async () => {
    if (!user || !product || !preview) return;
    setSaving(true);

    const { error } = await supabase.from("weighings").insert({
      user_id: user.id,
      product_id: product.id,
      product_name: product.name,
      grams: parseFloat(grams),
      meal_type: mealType as "breakfast" | "lunch" | "dinner" | "snack",
      kcal: preview.kcal,
      protein: preview.protein,
      carbs: preview.carbs,
      fat: preview.fat,
    });

    if (error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.success(`${product.name} aggiunto!`);
      queryClient.invalidateQueries({ queryKey: ["daily-nutrition"] });
      resetAll();
    }
    setSaving(false);
  }, [user, product, preview, grams, mealType, queryClient]);

  const resetAll = () => {
    setProduct(null);
    setNotFound(false);
    setGrams("");
    setMealType("lunch");
    setManualCode("");
    setLookupSource("");
    setShowManual(false);
    // Restart scanner
    setTimeout(() => startScanner(), 300);
  };

  // ── Scanner view (no product yet) ──
  if (!product && !loading && !notFound) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        {/* Header overlay */}
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center gap-3 bg-gradient-to-b from-black/60 to-transparent px-4 pb-6 pt-4">
          <button onClick={() => { stopScanner(); navigate(-1); }}>
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">Scanner per codici a barre</h1>
        </div>

        {/* Camera area – full screen */}
        <div ref={containerRef} className="relative flex-1">
          <div id="barcode-reader" className="h-full w-full [&>video]:h-full [&>video]:w-full [&>video]:object-cover" />

          {/* Corner brackets overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-72">
              {/* Top-left */}
              <div className="absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-[3px] border-t-[3px] border-white/80" />
              {/* Top-right */}
              <div className="absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-[3px] border-t-[3px] border-white/80" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-[3px] border-l-[3px] border-white/80" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-[3px] border-r-[3px] border-white/80" />
            </div>
          </div>

          {/* Not scanning yet – tap to start */}
          {!scanning && !showManual && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <button
                onClick={startScanner}
                className="rounded-2xl bg-white/10 px-6 py-4 text-white backdrop-blur"
              >
                Tocca per avviare la fotocamera
              </button>
            </div>
          )}

          {/* Manual input overlay */}
          {showManual && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-8">
              <div className="w-full max-w-sm space-y-3 rounded-2xl bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground">Inserisci codice a barre</h3>
                <Input
                  placeholder="Codice a barre…"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setShowManual(false); startScanner(); }}>
                    Annulla
                  </Button>
                  <Button className="flex-1" onClick={handleManualSubmit}>Cerca</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Flash toggle */}
        <div className="absolute inset-x-0 bottom-36 flex flex-col items-center gap-1">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur">
            <Zap className="h-5 w-5 text-white" />
          </button>
          <span className="text-xs text-white/70">Accendi la torcia</span>
        </div>

        {/* Bottom bar */}
        <div className="bg-black/60 px-6 pb-10 pt-5 backdrop-blur" style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom, 2.5rem))" }}>
          <div className="mx-auto flex max-w-sm justify-center gap-8">
            <button
              onClick={() => { stopScanner(); setShowManual(true); }}
              className="flex flex-col items-center gap-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <PenSquare className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-white/80">Inserimento manuale</span>
            </button>

            <button className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Image className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs text-white/80">Album</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Ricerca prodotto…</p>
      </div>
    );
  }

  // ── Not found ──
  if (notFound) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <div className="flex items-center gap-3 border-b px-4 py-4">
          <button onClick={() => { resetAll(); }}>
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
          <span className="text-base font-semibold">Scanner</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
          <p className="text-center text-muted-foreground">Prodotto non trovato 😕</p>
          <Button onClick={resetAll}>Scansiona un altro</Button>
        </div>
      </div>
    );
  }

  // ── Product found ──
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-3 border-b px-4 py-4">
        <button onClick={resetAll}>
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <span className="text-base font-semibold">Informazioni sul cibo</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
        <div className="mx-auto w-full max-w-sm space-y-4">
          {/* Product card */}
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-3">
              {product!.image_url ? (
                <img src={product!.image_url} alt={product!.name} className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-2xl">🍽️</div>
              )}
              <div>
                <div className="text-sm font-semibold text-foreground">{product!.name}</div>
                {product!.brand && <div className="text-xs text-muted-foreground">{product!.brand}</div>}
                <div className="text-xs text-muted-foreground">{product!.kcal_per_100g}kcal / 100g</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-lg font-bold" style={{ color: "#ef7b45" }}>{product!.kcal_per_100g}<span className="text-xs font-normal">kcal</span></div>
                <div className="text-[10px] text-muted-foreground">Calorie</div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "#5ba0d9" }}>{product!.carbs_per_100g}<span className="text-xs font-normal">g</span></div>
                <div className="text-[10px] text-muted-foreground">Carboidrati</div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "#6bc26b" }}>{product!.protein_per_100g}<span className="text-xs font-normal">g</span></div>
                <div className="text-[10px] text-muted-foreground">Proteine</div>
              </div>
              <div>
                <div className="text-lg font-bold" style={{ color: "#f5c542" }}>{product!.fat_per_100g}<span className="text-xs font-normal">g</span></div>
                <div className="text-[10px] text-muted-foreground">Grasso</div>
              </div>
            </div>
          </div>

          {/* Gram input */}
          <div className="space-y-1">
            <Label className="text-xs">Grammi</Label>
            <Input
              type="number"
              step="1"
              min="1"
              max="2000"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
              placeholder="100"
              className="rounded-xl"
              autoFocus
            />
          </div>

          {preview && (
            <div className="grid grid-cols-4 gap-2 rounded-xl bg-primary/5 p-3 text-center">
              <div>
                <div className="text-sm font-bold" style={{ color: "#ef7b45" }}>{preview.kcal}</div>
                <div className="text-[9px] text-muted-foreground">kcal</div>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "#5ba0d9" }}>{preview.carbs}g</div>
                <div className="text-[9px] text-muted-foreground">Carbo</div>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "#6bc26b" }}>{preview.protein}g</div>
                <div className="text-[9px] text-muted-foreground">Proteine</div>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "#f5c542" }}>{preview.fat}g</div>
                <div className="text-[9px] text-muted-foreground">Grassi</div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">Pasto</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">🌅 Colazione</SelectItem>
                <SelectItem value="lunch">☀️ Pranzo</SelectItem>
                <SelectItem value="dinner">🌙 Cena</SelectItem>
                <SelectItem value="snack">🍪 Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={resetAll}>
              Scansiona altro
            </Button>
            <Button
              className="flex-1 rounded-xl"
              disabled={!preview || saving}
              onClick={handleSave}
            >
              {saving ? "Salvataggio…" : "Salva ✓"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scan;
