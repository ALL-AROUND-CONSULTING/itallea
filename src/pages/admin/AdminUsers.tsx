import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type AdminUser = {
  id: string;
  email: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  onboarding_completed: boolean;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive shrink-0">
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
