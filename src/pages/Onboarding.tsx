import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateTDEE, calculateMacros, calculateAge } from "@/lib/nutrition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentario", desc: "Lavoro d'ufficio, poco movimento" },
  { value: "light", label: "Leggermente attivo", desc: "Esercizio leggero 1-3 gg/sett" },
  { value: "moderate", label: "Moderatamente attivo", desc: "Esercizio moderato 3-5 gg/sett" },
  { value: "active", label: "Attivo", desc: "Esercizio intenso 6-7 gg/sett" },
  { value: "very_active", label: "Molto attivo", desc: "Esercizio molto intenso, lavoro fisico" },
];

const Onboarding = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [sex, setSex] = useState("");

  // Step 2
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");

  // Step 3
  const [activityLevel, setActivityLevel] = useState("");

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const canProceedStep1 = firstName.trim() && lastName.trim() && dateOfBirth && sex;
  const canProceedStep2 = weight && height && targetWeight;
  const canProceedStep3 = activityLevel;

  const handleComplete = async () => {
    if (!user) return;
    setSubmitting(true);

    const dob = new Date(dateOfBirth);
    const age = calculateAge(dob);
    const tdee = calculateTDEE({
      sex: sex as "male" | "female",
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
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Errore nel salvataggio: " + error.message);
      setSubmitting(false);
      return;
    }

    await refreshProfile();
    toast.success("Profilo completato! 🎉");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      {/* Progress */}
      <div className="sticky top-0 z-50 bg-background px-4 pb-2 pt-4">
        <div className="mx-auto max-w-sm">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Step {step} di {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-4 pt-6 pb-8">
        <Card className="w-full max-w-sm">
          {/* Step 1: Personal data */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl">👤 Dati Personali</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Mario" maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognome</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Rossi" maxLength={50} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Data di nascita</Label>
                  <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} max={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="space-y-2">
                  <Label>Sesso</Label>
                  <Select value={sex} onValueChange={setSex}>
                    <SelectTrigger><SelectValue placeholder="Seleziona" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Maschio</SelectItem>
                      <SelectItem value="female">Femmina</SelectItem>
                      <SelectItem value="other">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" disabled={!canProceedStep1} onClick={() => setStep(2)}>
                  Avanti
                </Button>
              </CardContent>
            </>
          )}

          {/* Step 2: Body measurements */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl">⚖️ Misurazioni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso attuale (kg)</Label>
                  <Input id="weight" type="number" step="0.1" min="30" max="300" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altezza (cm)</Label>
                  <Input id="height" type="number" step="0.1" min="100" max="250" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetWeight">Peso obiettivo (kg)</Label>
                  <Input id="targetWeight" type="number" step="0.1" min="30" max="300" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="70.0" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Indietro</Button>
                  <Button className="flex-1" disabled={!canProceedStep2} onClick={() => setStep(3)}>Avanti</Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Activity level */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-xl">🏃 Livello Attività</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setActivityLevel(opt.value)}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        activityLevel === opt.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Indietro</Button>
                  <Button className="flex-1" disabled={!canProceedStep3 || submitting} onClick={handleComplete}>
                    {submitting ? "Salvataggio…" : "Completa ✓"}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
