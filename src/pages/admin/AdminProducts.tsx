import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Plus, Loader2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Submission = {
  id: string;
  name: string;
  barcode: string | null;
  brand: string | null;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  status: string;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  barcode: string | null;
  brand: string | null;
  kcal_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

export default function AdminProducts() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // New product form
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brand, setBrand] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [subRes, prodRes] = await Promise.all([
      supabase.functions.invoke("admin-manage-products", { method: "GET", body: undefined, headers: {} }),
      supabase.functions.invoke("admin-manage-products", { method: "GET", headers: { "x-type": "products" } }),
    ]);
    // The edge function uses query params, but invoke doesn't support them easily.
    // We'll fetch both via the same function with different approaches.
    // Actually let's just call it twice - the default returns submissions
    setSubmissions(subRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // Fetch submissions
    const load = async () => {
      setLoading(true);
      const res = await supabase.functions.invoke("admin-manage-products", { method: "GET" });
      setSubmissions(res.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const handleAction = async (submissionId: string, action: "approve" | "reject") => {
    setActionId(submissionId);
    const res = await supabase.functions.invoke("admin-manage-products", {
      method: "POST",
      body: { action, submissionId },
    });
    if (res.error) {
      toast.error(`Errore ${action}`);
    } else {
      toast.success(action === "approve" ? "Approvato e aggiunto ai prodotti globali" : "Rifiutato");
      setSubmissions((prev) => prev.map((s) => s.id === submissionId ? { ...s, status: action === "approve" ? "approved" : "rejected" } : s));
    }
    setActionId(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Nome obbligatorio"); return; }
    setCreating(true);
    const res = await supabase.functions.invoke("admin-manage-products", {
      method: "POST",
      body: {
        name: name.trim(),
        barcode: barcode.trim() || undefined,
        brand: brand.trim() || undefined,
        kcal_per_100g: parseFloat(kcal) || 0,
        protein_per_100g: parseFloat(protein) || 0,
        carbs_per_100g: parseFloat(carbs) || 0,
        fat_per_100g: parseFloat(fat) || 0,
      },
    });
    if (res.error) {
      toast.error("Errore creazione prodotto");
    } else {
      toast.success("Prodotto globale creato");
      setName(""); setBarcode(""); setBrand(""); setKcal(""); setProtein(""); setCarbs(""); setFat("");
    }
    setCreating(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Tabs defaultValue="submissions">
        <TabsList className="w-full">
          <TabsTrigger value="submissions" className="flex-1">Proposte</TabsTrigger>
          <TabsTrigger value="create" className="flex-1">Nuovo Prodotto</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna proposta.</p>
          ) : (
            submissions.map((s) => (
              <Card key={s.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{s.name}</p>
                      {s.brand && <p className="text-xs text-muted-foreground">{s.brand}</p>}
                      {s.barcode && <p className="text-xs text-muted-foreground">EAN: {s.barcode}</p>}
                      <p className="text-xs mt-1">
                        {s.kcal_per_100g} kcal · P{s.protein_per_100g} · C{s.carbs_per_100g} · G{s.fat_per_100g}
                      </p>
                    </div>
                    {s.status === "pending" ? (
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="text-primary h-8 w-8" onClick={() => handleAction(s.id, "approve")} disabled={actionId === s.id}>
                          {actionId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleAction(s.id, "reject")} disabled={actionId === s.id}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className={`text-xs shrink-0 ${s.status === "approved" ? "text-primary" : "text-destructive"}`}>
                        {s.status === "approved" ? "✓ Approvato" : "✗ Rifiutato"}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <h2 className="font-semibold text-sm">Nuovo prodotto globale</h2>
              <div className="space-y-1">
                <Label className="text-xs">Nome *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome prodotto" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Barcode</Label>
                  <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="EAN" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Brand</Label>
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca" />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Kcal</Label>
                  <Input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Proteine</Label>
                  <Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Carbo</Label>
                  <Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Grassi</Label>
                  <Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Crea Prodotto Globale
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
