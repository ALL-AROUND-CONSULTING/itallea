import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Trash2, Loader2, UtensilsCrossed, Users, UserCheck, UserX,
  Search, ArrowUpDown, ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  onboarding_completed: boolean;
};

type Weighing = {
  id: string;
  product_name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  logged_at: string;
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "🥐 Colazione",
  lunch: "🍝 Pranzo",
  dinner: "🍽️ Cena",
  snack: "🍎 Spuntino",
};

const PAGE_SIZE = 15;

type SortKey = "name" | "email" | "created_at" | "onboarding";
type SortDir = "asc" | "desc";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mealsUser, setMealsUser] = useState<AdminUser | null>(null);
  const [meals, setMeals] = useState<Weighing[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await supabase.functions.invoke("admin-manage-users", { method: "GET" });
    if (res.error) {
      toast.error("Errore caricamento utenti");
    } else {
      setUsers(res.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (userId: string) => {
    setDeletingId(userId);
    const res = await supabase.functions.invoke("admin-manage-users", {
      method: "DELETE",
      body: { userId },
    });
    if (res.error) {
      toast.error("Errore eliminazione utente");
    } else {
      toast.success("Utente eliminato");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setDeletingId(null);
  };

  const handleViewMeals = async (user: AdminUser) => {
    setMealsUser(user);
    setMealsLoading(true);
    const { data, error } = await supabase.functions.invoke(
      "admin-manage-users",
      { method: "GET", body: { userId: user.id } }
    );
    if (error) {
      toast.error("Errore caricamento pasti");
      setMeals([]);
    } else {
      setMeals(data ?? []);
    }
    setMealsLoading(false);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let result = users;
    if (q) {
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.first_name?.toLowerCase().includes(q)) ||
          (u.last_name?.toLowerCase().includes(q))
      );
    }
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": {
          const na = `${a.first_name ?? ""} ${a.last_name ?? ""}`.trim().toLowerCase();
          const nb = `${b.first_name ?? ""} ${b.last_name ?? ""}`.trim().toLowerCase();
          cmp = na.localeCompare(nb);
          break;
        }
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "created_at":
          cmp = a.created_at.localeCompare(b.created_at);
          break;
        case "onboarding":
          cmp = (a.onboarding_completed ? 1 : 0) - (b.onboarding_completed ? 1 : 0);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
    return result;
  }, [users, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Stats
  const totalUsers = users.length;
  const onboardedCount = users.filter((u) => u.onboarding_completed).length;
  const pendingCount = totalUsers - onboardedCount;

  // Group meals by date
  const mealsByDate = meals.reduce<Record<string, Weighing[]>>((acc, m) => {
    const date = m.logged_at;
    if (!acc[date]) acc[date] = [];
    acc[date].push(m);
    return acc;
  }, {});

  const SortHeader = ({ label, sortK }: { label: string; sortK: SortKey }) => (
    <button
      className="flex items-center gap-1 text-left font-medium hover:text-foreground transition-colors"
      onClick={() => toggleSort(sortK)}
    >
      {label}
      <ArrowUpDown className={`h-3 w-3 ${sortKey === sortK ? "text-primary" : "text-muted-foreground/50"}`} />
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Utenti totali</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{onboardedCount}</p>
              <p className="text-xs text-muted-foreground">Onboarding completato</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <UserX className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Onboarding incompleto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome o email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-8"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortHeader label="Nome" sortK="name" /></TableHead>
                  <TableHead><SortHeader label="Email" sortK="email" /></TableHead>
                  <TableHead className="hidden md:table-cell"><SortHeader label="Registrato" sortK="created_at" /></TableHead>
                  <TableHead className="hidden sm:table-cell"><SortHeader label="Onboarding" sortK="onboarding" /></TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Nessun utente trovato
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.first_name || u.last_name
                          ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("it-IT")}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {u.onboarding_completed ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            <UserCheck className="h-3 w-3" /> Completo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                            <UserX className="h-3 w-3" /> Incompleto
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewMeals(u)}
                            title="Vedi pasti"
                          >
                            <UtensilsCrossed className="h-4 w-4 text-primary" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                {deletingId === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Eliminare questo utente?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tutti i dati di {u.email} verranno eliminati permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(u.id)} className="bg-destructive text-destructive-foreground">
                                  Elimina
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                {filtered.length} risultati · Pagina {page + 1} di {totalPages}
              </p>
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

      {/* Meals modal */}
      <Dialog open={!!mealsUser} onOpenChange={(open) => !open && setMealsUser(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">
              🍽️ Pasti di {mealsUser?.first_name ?? mealsUser?.email}
            </DialogTitle>
          </DialogHeader>
          {mealsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : meals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nessun pasto registrato</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(mealsByDate)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, items]) => (
                  <div key={date}>
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">
                      {new Date(date).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <div className="space-y-1.5">
                      {items.map((m) => (
                        <div key={m.id} className="flex items-center justify-between rounded-xl border bg-card px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{m.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {MEAL_LABELS[m.meal_type] ?? m.meal_type} · {m.grams}g
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold">{m.kcal} kcal</p>
                            <p className="text-[10px] text-muted-foreground">
                              P{m.protein} C{m.carbs} G{m.fat}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
