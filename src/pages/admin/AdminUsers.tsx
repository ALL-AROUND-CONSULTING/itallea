import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2, UtensilsCrossed } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

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

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mealsUser, setMealsUser] = useState<AdminUser | null>(null);
  const [meals, setMeals] = useState<Weighing[]>([]);
  const [mealsLoading, setMealsLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Group meals by date
  const mealsByDate = meals.reduce<Record<string, Weighing[]>>((acc, m) => {
    const date = m.logged_at;
    if (!acc[date]) acc[date] = [];
    acc[date].push(m);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <p className="text-sm text-muted-foreground">{users.length} utenti registrati</p>
      {users.map((u) => (
        <Card key={u.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">
                {u.first_name || u.last_name
                  ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
                  : "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              <p className="text-xs text-muted-foreground">
                Registrato: {new Date(u.created_at).toLocaleDateString("it-IT")}
                {!u.onboarding_completed && " · Onboarding incompleto"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleViewMeals(u)}
                aria-label="Vedi pasti"
              >
                <UtensilsCrossed className="h-4 w-4" style={{ color: "hsl(var(--brand-blue))" }} />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive">
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
          </CardContent>
        </Card>
      ))}

      {/* Meals modal */}
      <Dialog open={!!mealsUser} onOpenChange={(open) => !open && setMealsUser(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-md">
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
