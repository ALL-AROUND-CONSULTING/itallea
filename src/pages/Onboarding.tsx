import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { calculateTDEE, calculateMacros, calculateAge } from "@/lib/nutrition";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Camera, Loader2 } from "lucide-react";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentario" },
  { value: "light", label: "Leggermente attivo" },
  { value: "moderate", label: "Moderatamente attivo" },
  { value: "active", label: "Attivo" },
  { value: "very_active", label: "Molto attivo" },
];

const SEX_OPTIONS = [
  { value: "male", label: "Maschio" },
  { value: "female", label: "Femmina" },
  { value: "other", label: "Altro" },
];

const Onboarding = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weight, setWeight] = useState("");

  // Step 2 fields
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [sex, setSex] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  // Dropdown states
  const [showSexDropdown, setShowSexDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);

  const canProceedStep1 = firstName.trim() && lastName.trim() && weight;
  const canComplete = height;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(urlData.publicUrl + "?t=" + Date.now());
      toast.success("Foto caricata!");
    } catch (err: any) {
      toast.error("Errore upload: " + (err.message || "Riprova"));
    } finally {
      setUploading(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setSubmitting(true);

    const dob = dateOfBirth ? new Date(dateOfBirth) : null;
    const age = dob ? calculateAge(dob) : 30;
    const sexVal = (sex || "male") as "male" | "female";
    const tdee = calculateTDEE({
      sex: sexVal,
      weight: parseFloat(weight),
      height: parseFloat(height),
      age,
      activityLevel: activityLevel || "moderate",
    });
    const macros = calculateMacros(tdee);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dateOfBirth || null,
        sex: sex || null,
        current_weight: parseFloat(weight),
        height: parseFloat(height),
        target_weight: targetWeight ? parseFloat(targetWeight) : null,
        activity_level: activityLevel || null,
        target_kcal: macros.kcal,
        target_protein: macros.protein,
        target_carbs: macros.carbs,
        target_fat: macros.fat,
        phone: phone.trim() ? "+39" + phone.trim() : null,
        avatar_url: avatarUrl,
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

  const inputClass =
    "w-full h-12 rounded-xl border border-border bg-white px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue))]/40 focus:border-[hsl(var(--brand-blue))] transition-colors";

  const selectRowClass =
    "flex w-full h-12 items-center justify-between rounded-xl border border-border bg-white px-4 text-sm transition-colors cursor-pointer hover:bg-muted/30";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      {/* Header */}
      <div className="flex items-center px-4 pt-6 pb-2">
        <button
          onClick={() => (step === 1 ? navigate(-1) : setStep(1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
          aria-label="Indietro"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold text-foreground">Le tue informazioni</h1>
          <p className="text-xs text-muted-foreground">Step {step}/2</p>
        </div>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-4 pb-8">
        {step === 1 && (
          <div className="space-y-3">
            <input
              className={inputClass}
              placeholder="Il tuo nome *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              maxLength={50}
            />
            <input
              className={inputClass}
              placeholder="Il tuo cognome *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              maxLength={50}
            />
            <input
              className={`${inputClass} bg-muted/30 cursor-not-allowed`}
              placeholder="La tua email *"
              value={user?.email || ""}
              readOnly
            />
            {/* Phone with +39 prefix */}
            <div className="flex h-12 rounded-xl border border-border bg-white overflow-hidden">
              <span className="flex items-center px-3 text-sm text-muted-foreground bg-muted/20 border-r border-border">
                +39
              </span>
              <input
                className="flex-1 h-full px-3 text-sm text-foreground placeholder:text-muted-foreground bg-white focus:outline-none"
                placeholder="Telefono"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={15}
              />
            </div>
            <input
              className={inputClass}
              placeholder="La tua data di nascita"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
            <input
              className={inputClass}
              placeholder="Il tuo peso * (kg)"
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 pb-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[hsl(var(--brand-blue))]/30 bg-muted/40 transition-colors hover:bg-muted/60"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand-blue))]" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              <p className="text-xs text-muted-foreground">Aggiungi un'immagine del profilo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Height */}
            <input
              className={inputClass}
              placeholder="La tua altezza * (cm)"
              type="number"
              step="0.1"
              min="100"
              max="250"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />

            {/* Target weight - chevron row */}
            <div className="relative">
              <input
                className={inputClass + " pr-10"}
                placeholder="Il tuo obiettivo (kg)"
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Sex - custom dropdown */}
            <div className="relative">
              <button
                type="button"
                className={selectRowClass}
                onClick={() => {
                  setShowSexDropdown(!showSexDropdown);
                  setShowActivityDropdown(false);
                }}
              >
                <span className={sex ? "text-foreground" : "text-muted-foreground"}>
                  {sex ? SEX_OPTIONS.find((o) => o.value === sex)?.label : "Sesso"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              {showSexDropdown && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                  {SEX_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSex(opt.value);
                        setShowSexDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/40 ${
                        sex === opt.value ? "bg-[hsl(var(--brand-blue))]/10 font-medium" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activity level - custom dropdown */}
            <div className="relative">
              <button
                type="button"
                className={selectRowClass}
                onClick={() => {
                  setShowActivityDropdown(!showActivityDropdown);
                  setShowSexDropdown(false);
                }}
              >
                <span className={activityLevel ? "text-foreground" : "text-muted-foreground"}>
                  {activityLevel
                    ? ACTIVITY_OPTIONS.find((o) => o.value === activityLevel)?.label
                    : "Fai Attività fisica?"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
              {showActivityDropdown && (
                <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl border border-border bg-white shadow-lg overflow-hidden">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setActivityLevel(opt.value);
                        setShowActivityDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/40 ${
                        activityLevel === opt.value ? "bg-[hsl(var(--brand-blue))]/10 font-medium" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-6 pb-8">
        <button
          type="button"
          onClick={step === 1 ? () => setStep(2) : handleComplete}
          disabled={step === 1 ? !canProceedStep1 : !canComplete || submitting}
          className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white transition-colors ${
            (step === 1 ? canProceedStep1 : canComplete && !submitting)
              ? "bg-[hsl(var(--brand-blue))] hover:bg-[hsl(var(--brand-dark-blue))]"
              : "bg-muted-foreground/30 cursor-not-allowed"
          }`}
        >
          {step === 2 && submitting ? "Salvataggio…" : "Avanti"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
