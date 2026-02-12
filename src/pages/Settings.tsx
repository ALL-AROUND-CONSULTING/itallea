import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  ArrowLeft,
  Moon,
  Scale,
  Download,
  Trash2,
  LogOut,
  Shield,
  QrCode,
  Unplug,
  Loader2,
  ChevronRight,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pairedDevice, setPairedDevice] = useState<any>(null);
  const [pairingCode, setPairingCode] = useState("");
  const [pairing, setPairing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("devices")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("paired_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPairedDevice(data));
  }, [user]);

  const handlePairDevice = async () => {
    if (!pairingCode.trim()) {
      toast.error("Inserisci il codice dispositivo");
      return;
    }
    setPairing(true);
    const res = await supabase.functions.invoke("pair-device", {
      method: "POST",
      body: { hardware_device_id: pairingCode.trim() },
    });
    if (res.error) {
      toast.error("Errore pairing: " + (res.error.message || "Riprova"));
    } else {
      toast.success(res.data.message || "Dispositivo collegato!");
      setPairingCode("");
      const { data } = await supabase
        .from("devices")
        .select("*")
        .eq("user_id", user!.id)
        .eq("is_active", true)
        .order("paired_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setPairedDevice(data);
    }
    setPairing(false);
  };

  const handleUnpairDevice = async () => {
    if (!pairedDevice) return;
    const res = await supabase.functions.invoke("pair-device", {
      method: "DELETE",
      body: { deviceId: pairedDevice.id },
    });
    if (res.error) {
      toast.error("Errore disconnessione");
    } else {
      toast.success("Dispositivo scollegato");
      setPairedDevice(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await supabase.functions.invoke("export-user-data");
      if (res.error) throw res.error;
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ital-lea-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Dati esportati con successo!");
    } catch (err: any) {
      toast.error("Errore esportazione: " + (err.message || "Riprova"));
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await supabase.functions.invoke("delete-account");
      if (res.error) throw res.error;
      toast.success("Account eliminato con successo.");
      await signOut();
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast.error("Errore eliminazione: " + (err.message || "Riprova"));
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Brand gradient header */}
      <div
        className="relative overflow-hidden pb-5"
        style={{
          background:
            "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
          </button>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "hsl(var(--brand-dark-blue))" }}
          >
            ⚙️ Impostazioni
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-sm space-y-3 px-4 py-4">
        {/* Theme toggle */}
        <div className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
            <span className="text-sm font-medium">Tema scuro</span>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>

        {/* Device pairing */}
        {pairedDevice ? (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-card p-4 shadow-sm">
            <Scale className="h-5 w-5 shrink-0" style={{ color: "hsl(var(--brand-blue))" }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Bilancia collegata</p>
              <p className="truncate text-xs text-muted-foreground">
                {pairedDevice.hardware_device_id}
                {pairedDevice.serial_number && ` · S/N ${pairedDevice.serial_number}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive"
              onClick={handleUnpairDevice}
            >
              <Unplug className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
              <span className="text-sm font-medium">La mia bilancia</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Codice dispositivo o QR"
                value={pairingCode}
                onChange={(e) => setPairingCode(e.target.value)}
                className="h-9 text-sm"
              />
              <Button
                size="sm"
                onClick={handlePairDevice}
                disabled={pairing}
                className="h-9 shrink-0"
                style={{ background: "hsl(var(--brand-blue))" }}
              >
                {pairing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <QrCode className="mr-1 h-3 w-3" />
                )}
                Collega
              </Button>
            </div>
          </div>
        )}

        {/* Admin link */}
        {isAdmin && (
          <button
            className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-medium shadow-sm"
            onClick={() => navigate("/admin")}
          >
            <Shield className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
            <span>Pannello Admin</span>
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </button>
        )}

        {/* Export */}
        <button
          className="flex w-full items-center gap-3 rounded-2xl border bg-card p-4 text-sm font-medium shadow-sm"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "hsl(var(--brand-blue))" }} />
          ) : (
            <Download className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
          )}
          <span>Esporta dati</span>
          {exporting && (
            <span className="ml-auto text-xs text-muted-foreground">Esportazione…</span>
          )}
        </button>

        {/* Delete account */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-card p-4 text-sm font-medium text-destructive shadow-sm">
              {deleting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
              <span>Elimina account</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Sei sicuro di voler eliminare il tuo account?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione è irreversibile. Tutti i tuoi dati verranno eliminati
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleting}
              >
                {deleting ? "Eliminazione…" : "Elimina definitivamente"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Esci
        </Button>
      </div>
    </>
  );
};

export default Settings;
