import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, Search, Package } from "lucide-react";

type UserProduct = {
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
};

const emptyForm = {
  name: "",
  brand: "",
  barcode: "",
  kcal_per_100g: "",
  protein_per_100g: "",
  carbs_per_100g: "",
  fat_per_100g: "",
  fiber_per_100g: "",
  salt_per_100g: "",
};

const MyProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_products")
      .select("id, name, brand, barcode, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, salt_per_100g")
      .eq("user_id", user.id)
      .order("name");
    setProducts(
      (data ?? []).map((p) => ({
        ...p,
        kcal_per_100g: Number(p.kcal_per_100g),
        protein_per_100g: Number(p.protein_per_100g),
        carbs_per_100g: Number(p.carbs_per_100g),
        fat_per_100g: Number(p.fat_per_100g),
        fiber_per_100g: Number(p.fiber_per_100g),
        salt_per_100g: Number(p.salt_per_100g),
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (p: UserProduct) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand ?? "",
      barcode: p.barcode ?? "",
      kcal_per_100g: p.kcal_per_100g.toString(),
      protein_per_100g: p.protein_per_100g.toString(),
      carbs_per_100g: p.carbs_per_100g.toString(),
      fat_per_100g: p.fat_per_100g.toString(),
      fiber_per_100g: p.fiber_per_100g.toString(),
      salt_per_100g: p.salt_per_100g.toString(),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.name.trim()) {
      toast.error("Il nome è obbligatorio");
      return;
    }
    setSaving(true);

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      brand: form.brand.trim() || null,
      barcode: form.barcode.trim() || null,
      kcal_per_100g: parseFloat(form.kcal_per_100g) || 0,
      protein_per_100g: parseFloat(form.protein_per_100g) || 0,
      carbs_per_100g: parseFloat(form.carbs_per_100g) || 0,
      fat_per_100g: parseFloat(form.fat_per_100g) || 0,
      fiber_per_100g: parseFloat(form.fiber_per_100g) || 0,
      salt_per_100g: parseFloat(form.salt_per_100g) || 0,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("user_products")
        .update(payload)
        .eq("id", editingId)
        .eq("user_id", user.id));
    } else {
      ({ error } = await supabase.from("user_products").insert(payload));
    }

    if (error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.success(editingId ? "Prodotto aggiornato!" : "Prodotto creato!");
      setDialogOpen(false);
      fetchProducts();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId || !user) return;
    const { error } = await supabase
      .from("user_products")
      .delete()
      .eq("id", deleteId)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.success("Prodotto eliminato");
      fetchProducts();
    }
    setDeleteId(null);
  };

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const filtered = search
    ? products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  return (
    <>
      <PageHeader title="I Miei Prodotti" showBack />
      <div className="mx-auto max-w-sm space-y-3 px-4 pb-6 pt-2">
        {/* Search + Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button size="icon" onClick={openNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Empty */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nessun prodotto personale ancora.
            </p>
            <Button size="sm" onClick={openNew}>
              <Plus className="mr-1 h-4 w-4" /> Aggiungi il primo
            </Button>
          </div>
        )}

        {/* Product list */}
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border bg-card p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium text-foreground">
                {p.name}
              </div>
              {p.brand && (
                <div className="text-xs text-muted-foreground">{p.brand}</div>
              )}
              <div className="mt-1 flex gap-2 text-[10px] text-muted-foreground">
                <span>{p.kcal_per_100g} kcal</span>
                <span>P {p.protein_per_100g}g</span>
                <span>C {p.carbs_per_100g}g</span>
                <span>G {p.fat_per_100g}g</span>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => openEdit(p)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
              onClick={() => setDeleteId(p.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "✏️ Modifica Prodotto" : "➕ Nuovo Prodotto"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Brand</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setField("brand", e.target.value)}
                  maxLength={100}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Barcode</Label>
                <Input
                  value={form.barcode}
                  onChange={(e) => setField("barcode", e.target.value)}
                  maxLength={50}
                />
              </div>
            </div>

            <p className="text-xs font-medium text-muted-foreground pt-1">
              Valori per 100g
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Kcal</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.kcal_per_100g}
                  onChange={(e) => setField("kcal_per_100g", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Proteine (g)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.protein_per_100g}
                  onChange={(e) => setField("protein_per_100g", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Carboidrati (g)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.carbs_per_100g}
                  onChange={(e) => setField("carbs_per_100g", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Grassi (g)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.fat_per_100g}
                  onChange={(e) => setField("fat_per_100g", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fibre (g)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.fiber_per_100g}
                  onChange={(e) => setField("fiber_per_100g", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Sale (g)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salt_per_100g}
                  onChange={(e) => setField("salt_per_100g", e.target.value)}
                />
              </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? "Salvataggio…" : editingId ? "Aggiorna" : "Crea Prodotto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo prodotto?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyProducts;
