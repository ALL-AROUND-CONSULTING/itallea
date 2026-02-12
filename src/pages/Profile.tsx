import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateTDEE, calculateMacros, calculateAge } from "@/lib/nutrition";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LogOut, Moon, Scale, Download, Trash2, Package, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentario" },
  { value: "light", label: "Leggermente attivo" },
  { value: "moderate", label: "Moderatamente attivo" },
  { value: "active", label: "Attivo" },
  { value: "very_active", label: "Molto attivo" },
];

type FullProfile = {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: string;
  current_weight: number;
  height: number;
  target_weight: number;
  activity_level: string;
  target_kcal: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  water_goal_ml: number;
};

const Profile = () => {
  const { user, signOut, refreshProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Editable fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [waterGoal, setWaterGoal] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, date_of_birth, sex, current_weight, height, target_weight, activity_level, target_kcal, target_protein, target_carbs, target_fat, water_goal_ml")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile(data as unknown as FullProfile);
          setFirstName(data.first_name ?? "");
          setLastName(data.last_name ?? "");
          setDateOfBirth(data.date_of_birth ?? "");
          setSex(data.sex ?? "");
          setWeight(data.current_weight?.toString() ?? "");
          setHeight(data.height?.toString() ?? "");
          setTargetWeight(data.target_weight?.toString() ?? "");
          setActivityLevel(data.activity_level ?? "");
          setWaterGoal(data.water_goal_ml?.toString() ?? "2000");
        }
        setLoading(false);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const dob = new Date(dateOfBirth);
    const age = calculateAge(dob);
    const sexVal = sex as "male" | "female";
    const tdee = calculateTDEE({
      sex: sexVal === "male" || sexVal === "female" ? sexVal : "male",
      weight: parseFloat(weight),
      height: parseFloat(height),
      age,
      activityLevel,
    });
    const macros = calculateMacros(tdee);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth,
        sex,
        current_weight: parseFloat(weight),
        height: parseFloat(height),
        target_weight: parseFloat(targetWeight),
        activity_level: activityLevel,
        target_kcal: macros.kcal,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fat: macros.fat,
        water_goal_ml: parseInt(waterGoal) || 2000,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Errore: " + error.message);
    } else {
      toast.success("Profilo aggiornato! Target ricalcolati.");
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error("Sessione scaduta. Effettua di nuovo il login.");
        return;
      }
      const res = await supabase.functions.invoke("export-user-data");
      if (res.error) throw res.error;
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
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

  if (loading) {
    return (
      <>
        <PageHeader title="Profilo" showThemeToggle />
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Profilo" showThemeToggle />
      <div className="mx-auto max-w-sm space-y-4 px-4 py-4">
        {/* Personal data */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">👤 Dati Personali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Cognome</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data di nascita</Label>
              <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={new Date().toISOString().split("T")[0]} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sesso</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Maschio</SelectItem>
                  <SelectItem value="female">Femmina</SelectItem>
                  <SelectItem value="other">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Body */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">⚖️ Misurazioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Peso (kg)</Label>
                <Input type="number" step="0.1" min="30" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Altezza (cm)</Label>
                <Input type="number" step="0.1" min="100" max="250" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Obiettivo (kg)</Label>
                <Input type="number" step="0.1" min="30" max="300" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🏃 Attività & Idratazione</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Livello attività</Label>
              <Select value={activityLevel} onValueChange={setActivityLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Obiettivo acqua (ml/giorno)</Label>
              <Input type="number" step="100" min="500" max="5000" value={waterGoal} onChange={(e) => setWaterGoal(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Current targets (read-only preview) */}
        {profile && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🎯 Target Giornalieri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{profile.target_kcal}</div>
                  <div className="text-[10px] text-muted-foreground">kcal</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-chart-3">{profile.target_protein}g</div>
                  <div className="text-[10px] text-muted-foreground">Proteine</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">{profile.target_carbs}g</div>
                  <div className="text-[10px] text-muted-foreground">Carbo</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-chart-4">{profile.target_fat}g</div>
                  <div className="text-[10px] text-muted-foreground">Grassi</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          {saving ? "Salvataggio…" : "Salva e Ricalcola Target"}
        </Button>

        <Separator />

        {/* Theme toggle */}
        <div className="flex items-center justify-between rounded-lg border bg-card p-3">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Tema scuro</span>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>

        {/* Placeholder sections */}
        <div className="space-y-2">
          <button
            className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-sm text-foreground"
            onClick={() => navigate("/my-products")}
          >
            <Package className="h-4 w-4 text-primary" />
            <span>I miei prodotti</span>
            <span className="ml-auto text-xs text-muted-foreground">→</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-sm text-muted-foreground" disabled>
            <Scale className="h-4 w-4" />
            <span>La mia bilancia</span>
            <span className="ml-auto text-xs">Prossimamente</span>
          </button>
          <button
            className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-sm text-foreground"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Download className="h-4 w-4 text-primary" />}
            <span>Esporta dati</span>
            {exporting && <span className="ml-auto text-xs text-muted-foreground">Esportazione…</span>}
          </button>
          <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <AlertDialogTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg border border-destructive/30 bg-card p-3 text-sm text-destructive">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span>Elimina account</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei sicuro di voler eliminare il tuo account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione è irreversibile. Tutti i tuoi dati (profilo, pesate, acqua, peso, prodotti, ricette) verranno eliminati permanentemente.
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
        </div>

        {/* Logout */}
        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Esci
        </Button>
      </div>
    </>
  );
};

export default Profile;
