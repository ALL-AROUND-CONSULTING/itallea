import { useState, useEffect, useCallback } from "react";
import { RecipeList } from "@/components/recipes/RecipeList";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Package,
  ChefHat,
  Wine,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";

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

type RecipeCategory = { label: string; icon: string };
const RECIPE_CATEGORIES: RecipeCategory[] = [
  { label: "Antipasti", icon: "🍢" },
  { label: "Primi", icon: "🍝" },
  { label: "Secondi", icon: "🥩" },
  { label: "Contorni", icon: "🥗" },
  { label: "Dolci", icon: "🧁" },
];

type View = "hub" | "recipes" | "products" | "recipe-category";

const MyProducts = () => {
  const { user } = useAuth();
  const [view, setView] = useState<View>("hub");
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null);
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_products")
      .select(
        "id, name, brand, barcode, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, salt_per_100g"
      )
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

  if (view === "recipe-category" && selectedCategory) {
    return (
      <>
        <div className="mx-auto max-w-lg">
          <div
            className="relative overflow-hidden pb-6"
            style={{
              background:
                "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
              borderRadius: "0 0 2rem 2rem",
            }}
          >
            <div className="flex items-center justify-center gap-2 pt-10 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <span className="text-base">🍽️</span>
              </div>
              <span className="text-xl font-bold tracking-wide" style={{ color: "hsl(var(--brand-dark-blue))" }}>
                ITAL LEA
              </span>
            </div>
            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setView("recipes"); setSelectedCategory(null); }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <h1 className="text-lg font-bold text-foreground">{selectedCategory.label}</h1>
              </div>
            </div>
          </div>
          <RecipeList category={selectedCategory.label} categoryIcon={selectedCategory.icon} />
        </div>
      </>
    );
  }

  if (view !== "hub" && view !== "recipe-category") {
    return (
      <>
        <div className="mx-auto max-w-lg">
         {/* Sub-page header with gradient */}
          <div
            className="relative overflow-hidden pb-6"
            style={{
              background:
                "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
              borderRadius: "0 0 2rem 2rem",
            }}
          >
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 pt-10 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                <span className="text-base">🍽️</span>
              </div>
              <span
                className="text-xl font-bold tracking-wide"
                style={{ color: "hsl(var(--brand-dark-blue))" }}
              >
                ITAL LEA
              </span>
            </div>

            {/* Title row */}
            <div className="flex items-center justify-between px-5 pb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setView("hub")}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm"
                >
                  <ArrowLeft className="h-5 w-5 text-foreground" />
                </button>
                <h1 className="text-lg font-bold text-foreground">
                  {view === "recipes" ? "Il mio Ricettario" : "I miei alimenti"}
                </h1>
              </div>
              {view === "products" && (
                <button
                  onClick={openNew}
                  className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
                  style={{ background: "hsl(var(--brand-blue))" }}
                  aria-label="Aggiungi prodotto"
                >
                  <Plus className="h-5 w-5 text-white" />
                </button>
              )}
            </div>

            {/* Search bar (only for products) */}
            {view === "products" && (
              <div className="px-5">
                <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur-sm">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cerca"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {view === "recipes" ? (
            <div className="px-4 pb-6 pt-2">
              <div className="grid grid-cols-2 gap-3">
                {RECIPE_CATEGORIES.map((cat) => (
                  <Card
                    key={cat.label}
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 border-0 p-5 shadow-md transition-transform active:scale-95"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setView("recipe-category");
                    }}
                  >
                    <span className="text-4xl">{cat.icon}</span>
                    <p className="text-center text-sm font-semibold text-foreground">
                      {cat.label}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 pb-6 pt-4">
              {loading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              )}

              {!loading && products.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    Nessun alimento personale ancora.
                  </p>
                  <Button size="sm" onClick={openNew}>
                    <Plus className="mr-1 h-4 w-4" /> Aggiungi il primo
                  </Button>
                </div>
              )}

              {/* Clean product list */}
              <div className="space-y-0 divide-y divide-border">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    className="flex w-full items-center justify-between py-3.5 text-left transition-colors active:bg-muted/50"
                    onClick={() => openEdit(p)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {p.name}
                        {p.brand ? ` ${p.brand}` : ""}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(p.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dialogs */}
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
              <p className="pt-1 text-xs font-medium text-muted-foreground">
                Valori per 100g
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["kcal_per_100g", "Kcal", "0.1"],
                  ["protein_per_100g", "Proteine (g)", "0.1"],
                  ["carbs_per_100g", "Carboidrati (g)", "0.1"],
                  ["fat_per_100g", "Grassi (g)", "0.1"],
                  ["fiber_per_100g", "Fibre (g)", "0.1"],
                  ["salt_per_100g", "Sale (g)", "0.01"],
                ].map(([key, label, step]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      type="number"
                      min="0"
                      step={step}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setField(key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                {saving
                  ? "Salvataggio…"
                  : editingId
                  ? "Aggiorna"
                  : "Crea Prodotto"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!deleteId}
          onOpenChange={(v) => !v && setDeleteId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminare questo prodotto?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non può essere annullata.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Elimina
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // ── Hub view (matches mockup) ──
  return (
    <div className="mx-auto max-w-lg">
      {/* Header with gradient */}
      <div
        className="relative overflow-hidden pb-6"
        style={{
          background:
            "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 pt-10 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/80 shadow-sm">
            <span className="text-base">🍽️</span>
          </div>
          <span
            className="text-xl font-bold tracking-wide"
            style={{ color: "hsl(var(--brand-dark-blue))" }}
          >
            ITAL LEA
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "hsl(200, 90%, 95%)" }}
            >
              <Package className="h-6 w-6" style={{ color: "hsl(var(--brand-blue))" }} />
            </div>
            <h1 className="text-xl font-bold text-foreground">Il mio database</h1>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full shadow-sm"
            style={{ background: "hsl(var(--brand-blue))" }}
            aria-label="Assistente"
          >
            <MessageCircle className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-4 px-4 py-5">
        {/* Ricettario */}
        <Card
          className="cursor-pointer overflow-hidden border-0 shadow-md transition-transform active:scale-[0.98]"
          onClick={() => setView("recipes")}
        >
          <div className="px-4 pt-4">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
              style={{ background: "hsl(var(--brand-blue))" }}
            >
              Il mio ricettario
            </span>
          </div>
          <div className="flex items-center justify-between px-4 pb-4 pt-3">
            <div>
              <p className="text-base font-semibold text-foreground">
                Visualizza le tue ricette
              </p>
              <p className="text-sm text-muted-foreground">
                e aggiungi nuove ricette
                <br />
                con facilità
              </p>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "hsl(200, 90%, 95%)" }}
            >
              <ChefHat className="h-9 w-9" style={{ color: "hsl(var(--brand-blue))" }} />
            </div>
          </div>
        </Card>

        {/* Prodotti */}
        <Card
          className="cursor-pointer overflow-hidden border-0 shadow-md transition-transform active:scale-[0.98]"
          onClick={() => setView("products")}
        >
          <div className="px-4 pt-4">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-white"
              style={{ background: "hsl(var(--brand-blue))" }}
            >
              I miei prodotti
            </span>
          </div>
          <div className="flex items-center justify-between px-4 pb-4 pt-3">
            <div>
              <p className="text-base font-semibold text-foreground">
                Visualizza i tuoi alimenti
              </p>
              <p className="text-sm text-muted-foreground">
                e aggiungi nuovi alimenti
              </p>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "hsl(24, 80%, 95%)" }}
            >
              <Wine className="h-9 w-9 text-accent" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyProducts;
