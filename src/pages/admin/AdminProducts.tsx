import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Check, X, Plus, Loader2, Search, Package, Clock, CheckCircle2, XCircle,
  ArrowUpDown, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

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

const PAGE_SIZE = 15;

export default function AdminProducts() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [page, setPage] = useState(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // New product form
  const [name, setName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [brand, setBrand] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = submissions;
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (q) {
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.brand?.toLowerCase().includes(q) || s.barcode?.includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const cmp = a.created_at.localeCompare(b.created_at);
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [submissions, search, statusFilter, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Stats
  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === "approved") return <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"><CheckCircle2 className="h-3 w-3" />Approvato</span>;
    if (status === "rejected") return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive"><XCircle className="h-3 w-3" />Rifiutato</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"><Clock className="h-3 w-3" />In attesa</span>;
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">In attesa</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approvati</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{rejectedCount}</p>
              <p className="text-xs text-muted-foreground">Rifiutati</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Proposte</TabsTrigger>
          <TabsTrigger value="create">Nuovo Prodotto</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cerca nome, brand o barcode…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-8"
                  />
                </div>
                <div className="flex gap-1">
                  {(["all", "pending", "approved", "rejected"] as const).map((s) => (
                    <Button
                      key={s}
                      variant={statusFilter === s ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => { setStatusFilter(s); setPage(0); }}
                    >
                      {s === "all" ? "Tutti" : s === "pending" ? "In attesa" : s === "approved" ? "Approvati" : "Rifiutati"}
                    </Button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prodotto</TableHead>
                        <TableHead className="hidden sm:table-cell">Brand</TableHead>
                        <TableHead className="hidden md:table-cell">EAN</TableHead>
                        <TableHead className="hidden lg:table-cell">Kcal</TableHead>
                        <TableHead className="hidden lg:table-cell">P / C / G</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>
                          <button className="flex items-center gap-1" onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}>
                            Data <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </TableHead>
                        <TableHead className="text-right">Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paged.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nessuna proposta</TableCell>
                        </TableRow>
                      ) : (
                        paged.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">{s.brand ?? "—"}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-xs">{s.barcode ?? "—"}</TableCell>
                            <TableCell className="hidden lg:table-cell">{s.kcal_per_100g}</TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {s.protein_per_100g} / {s.carbs_per_100g} / {s.fat_per_100g}
                            </TableCell>
                            <TableCell><StatusBadge status={s.status} /></TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(s.created_at).toLocaleDateString("it-IT")}
                            </TableCell>
                            <TableCell className="text-right">
                              {s.status === "pending" ? (
                                <div className="flex justify-end gap-1">
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => handleAction(s.id, "approve")} disabled={actionId === s.id}>
                                    {actionId === s.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleAction(s.id, "reject")} disabled={actionId === s.id}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-xs text-muted-foreground">{filtered.length} risultati · Pagina {page + 1} di {totalPages}</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card className="max-w-lg">
            <CardContent className="space-y-4 p-5">
              <h2 className="font-semibold">Nuovo prodotto globale</h2>
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
