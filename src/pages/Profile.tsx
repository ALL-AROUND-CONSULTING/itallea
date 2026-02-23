import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateTDEE, calculateMacros, calculateAge } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Settings, Camera, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  phone: string | null;
  avatar_url: string | null;
};

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [waterGoal, setWaterGoal] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, date_of_birth, sex, current_weight, height, target_weight, activity_level, target_kcal, target_protein, target_carbs, target_fat, water_goal_ml, phone, avatar_url")
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
          setPhone(data.phone ?? "");
          setAvatarUrl(data.avatar_url ?? null);
        }
        setLoading(false);
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const newUrl = urlData.publicUrl + "?t=" + Date.now();
      setAvatarUrl(newUrl);
      await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", user.id);
      toast.success("Foto profilo aggiornata!");
    } catch (err: any) {
      toast.error("Errore upload: " + (err.message || "Riprova"));
    } finally {
      setAvatarUploading(false);
    }
  };

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
        phone: phone.trim() || null,
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

  const initials = ((firstName || "U")[0] ?? "U").toUpperCase();

  const canCalculate = parseFloat(weight) > 0 && parseFloat(height) > 0;

  const liveTargets = useMemo(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w <= 0 || h <= 0) {
      return profile ? { kcal: profile.target_kcal, protein: profile.target_protein, carbs: profile.target_carbs, fat: profile.target_fat } : null;
    }
    const dob = dateOfBirth ? new Date(dateOfBirth) : null;
    const age = dob ? calculateAge(dob) : 30;
    const sexVal = sex === "male" || sex === "female" ? sex : "male";
    const tdee = calculateTDEE({ sex: sexVal, weight: w, height: h, age, activityLevel: activityLevel || "moderate" });
    return calculateMacros(tdee);
  }, [weight, height, dateOfBirth, sex, activityLevel, profile]);

  const targetsChanged = useMemo(() => {
    if (!liveTargets || !profile) return false;
    return liveTargets.kcal !== profile.target_kcal || liveTargets.protein !== profile.target_protein || liveTargets.carbs !== profile.target_carbs || liveTargets.fat !== profile.target_fat;
  }, [liveTargets, profile]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Brand gradient header with avatar */}
      <div
        className="relative overflow-hidden pb-6"
        style={{
          background:
            "linear-gradient(180deg, hsl(200 90% 92%) 0%, hsl(210 80% 85%) 60%, hsl(var(--background)) 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        {/* Settings gear icon */}
        <div className="flex justify-end px-4 pt-5">
          <motion.button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm"
            aria-label="Impostazioni"
            onClick={() => navigate("/settings")}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
          >
            <Settings className="h-5 w-5" style={{ color: "hsl(var(--brand-blue))" }} />
          </motion.button>
        </div>

        {/* Avatar */}
        <motion.div
          className="flex flex-col items-center gap-1 pb-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white shadow-lg"
            style={{ background: "hsl(var(--brand-blue))" }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : avatarUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              initials
            )}
            <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
              <Camera className="h-3 w-3 text-muted-foreground" />
            </div>
          </button>
          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <p
            className="mt-1 text-base font-semibold"
            style={{ color: "hsl(var(--brand-dark-blue))" }}
          >
            {firstName} {lastName}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </motion.div>
      </div>

      <div className="mx-auto max-w-sm space-y-4 px-4 py-4">
        {/* Personal data */}
        <Card className="rounded-2xl shadow-sm">
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
        <Card className="rounded-2xl shadow-sm">
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
        <Card className="rounded-2xl shadow-sm">
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
            <div className="space-y-1">
              <Label className="text-xs">Telefono (opzionale)</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+39 333 1234567" maxLength={20} />
            </div>
          </CardContent>
        </Card>

        {/* Current targets - live preview */}
        {liveTargets && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">🎯 Target Giornalieri</CardTitle>
                {targetsChanged && (
                  <Badge className="text-[10px]" style={{ background: "hsl(var(--brand-blue))" }}>Nuovi target</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">{liveTargets.kcal}</div>
                  <div className="text-[10px] text-muted-foreground">kcal</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-chart-3">{liveTargets.protein}g</div>
                  <div className="text-[10px] text-muted-foreground">Proteine</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-accent">{liveTargets.carbs}g</div>
                  <div className="text-[10px] text-muted-foreground">Carbo</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-chart-4">{liveTargets.fat}g</div>
                  <div className="text-[10px] text-muted-foreground">Grassi</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  className="w-full rounded-2xl"
                  onClick={handleSave}
                  disabled={saving || !canCalculate}
                  style={{ background: "hsl(var(--brand-blue))" }}
                >
                  {saving ? "Salvataggio…" : "Salva e Ricalcola Target"}
                </Button>
              </div>
            </TooltipTrigger>
            {!canCalculate && (
              <TooltipContent>
                <p>Inserisci peso e altezza per salvare</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

export default Profile;
