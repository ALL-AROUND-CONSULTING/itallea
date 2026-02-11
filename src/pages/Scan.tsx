import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
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
import { Camera, CameraOff, Keyboard, Loader2 } from "lucide-react";

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
  const queryClient = useQueryClient();

  // Scanner state
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lookup state
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ScannedProduct | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [lookupSource, setLookupSource] = useState<string>("");

  // Weighing form
  const [grams, setGrams] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    };
  }, []);

  const lookupBarcode = useCallback(
    async (code: string) => {
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
    },
    []
  );

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;

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
          scanner.stop().then(() => {
            scanner.clear();
            scannerRef.current = null;
            setScanning(false);
            lookupBarcode(decodedText);
          });
        },
        () => {} // ignore scan errors
      );

      setScanning(true);
    } catch (err: any) {
      toast.error("Impossibile accedere alla fotocamera");
    }
  }, [lookupBarcode]);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current.clear();
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
  };

  return (
    <>
      <PageHeader title="Scansiona" />
      <div className="flex flex-1 flex-col px-4 pb-6 pt-2">
        {/* Phase 1: No product yet – show scanner or manual input */}
        {!product && !loading && !notFound && (
          <div className="flex flex-1 flex-col items-center gap-4">
            {/* Camera preview area */}
            <div
              ref={containerRef}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border bg-muted"
              style={{ minHeight: scanning ? 300 : 200 }}
            >
              <div id="barcode-reader" className="w-full" />
              {!scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera className="h-12 w-12 text-muted-foreground/50" />
                  <Button onClick={startScanner}>
                    <Camera className="mr-2 h-4 w-4" /> Avvia Fotocamera
                  </Button>
                </div>
              )}
            </div>

            {scanning && (
              <Button variant="outline" onClick={stopScanner}>
                <CameraOff className="mr-2 h-4 w-4" /> Ferma Scanner
              </Button>
            )}

            <div className="flex w-full max-w-sm items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">oppure</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {!showManual ? (
              <Button variant="outline" onClick={() => { stopScanner(); setShowManual(true); }}>
                <Keyboard className="mr-2 h-4 w-4" /> Inserisci Codice
              </Button>
            ) : (
              <div className="flex w-full max-w-sm gap-2">
                <Input
                  placeholder="Codice a barre…"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                  autoFocus
                />
                <Button onClick={handleManualSubmit}>Cerca</Button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Ricerca prodotto…</p>
          </div>
        )}

        {/* Not found */}
        {notFound && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-center text-muted-foreground">
              Prodotto non trovato 😕
            </p>
            <Button onClick={resetAll}>Scansiona un altro</Button>
          </div>
        )}

        {/* Phase 2: Product found – show details + weighing form */}
        {product && (
          <div className="mx-auto w-full max-w-sm space-y-4">
            {/* Product card */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex gap-3">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  {product.brand && (
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                  )}
                  <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    {lookupSource === "local" ? "Database locale" : "Open Food Facts"}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-sm font-bold text-primary">{product.kcal_per_100g}</div>
                  <div className="text-[9px] text-muted-foreground">kcal</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{product.protein_per_100g}g</div>
                  <div className="text-[9px] text-muted-foreground">Proteine</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{product.carbs_per_100g}g</div>
                  <div className="text-[9px] text-muted-foreground">Carbo</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{product.fat_per_100g}g</div>
                  <div className="text-[9px] text-muted-foreground">Grassi</div>
                </div>
              </div>
              <p className="mt-1 text-center text-[9px] text-muted-foreground">per 100g</p>
            </div>

            {/* Weighing form */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Grammi</Label>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  max="2000"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="150"
                  autoFocus
                />
              </div>

              {preview && (
                <div className="grid grid-cols-4 gap-2 rounded-lg bg-primary/5 p-3 text-center">
                  <div>
                    <div className="text-sm font-bold text-primary">{preview.kcal}</div>
                    <div className="text-[9px] text-muted-foreground">kcal</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{preview.protein}g</div>
                    <div className="text-[9px] text-muted-foreground">Proteine</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{preview.carbs}g</div>
                    <div className="text-[9px] text-muted-foreground">Carbo</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{preview.fat}g</div>
                    <div className="text-[9px] text-muted-foreground">Grassi</div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Pasto</Label>
                <Select value={mealType} onValueChange={setMealType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🌅 Colazione</SelectItem>
                    <SelectItem value="lunch">☀️ Pranzo</SelectItem>
                    <SelectItem value="dinner">🌙 Cena</SelectItem>
                    <SelectItem value="snack">🍪 Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetAll}>
                  Scansiona altro
                </Button>
                <Button
                  className="flex-1"
                  disabled={!preview || saving}
                  onClick={handleSave}
                >
                  {saving ? "Salvataggio…" : "Salva ✓"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Scan;
