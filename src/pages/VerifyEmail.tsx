import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { setTokens } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

const VerifyEmail = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--brand-blue))] border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const email = new URLSearchParams(window.location.search).get("email") || "";
  const code = otp.join("");
  const isComplete = code.length === 6;

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setOtp(next);
  };

  const handleVerify = async () => {
    if (!isComplete) return;
    setSubmitting(true);
    try {
      const data = await apiClient<{
        access_token?: string;
        refresh_token?: string;
        expires_in?: number;
        message?: string;
      }>("/api/register/verify/", {
        method: "POST",
        body: { email, code },
        skipAuth: true,
      });

      // If verification returns tokens, auto-login
      if (data.access_token && data.refresh_token) {
        setTokens(data.access_token, data.refresh_token, data.expires_in ?? 3600);
        toast.success("Email verificata con successo!");
        window.location.href = "/";
      } else {
        toast.success(data.message || "Email verificata! Ora puoi accedere.");
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Codice non valido");
    }
    setSubmitting(false);
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email mancante. Torna alla registrazione.");
      return;
    }
    try {
      await apiClient("/api/register/resend/", {
        method: "POST",
        body: { email },
        skipAuth: true,
      });
      toast.success("Codice reinviato! Controlla la tua email.");
    } catch (err: any) {
      toast.error(err.message || "Errore nell'invio del codice");
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white px-6 py-12">
      <div className="relative mb-10 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors"
          aria-label="Torna indietro"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <AuthLogo size="sm" />
      </div>

      <h1 className="mb-2 text-center text-xl font-bold text-foreground">Verifica email</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Inserisci il codice a 6 cifre inviato a{" "}
        <span className="font-medium text-foreground">{email || "la tua email"}</span>
      </p>

      <div className="mx-auto flex gap-3" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-12 w-12 rounded-xl border border-border bg-background text-center text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue))]/40 focus:border-[hsl(var(--brand-blue))] transition-colors"
            autoFocus={i === 0}
          />
        ))}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Non hai ricevuto il codice?{" "}
        <button type="button" onClick={handleResend} className="font-medium text-[hsl(var(--brand-blue))] hover:underline">
          Invia di nuovo
        </button>
      </p>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleVerify}
          disabled={!isComplete || submitting}
          className={`flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white transition-colors ${
            isComplete
              ? "bg-[hsl(var(--brand-blue))] hover:bg-[hsl(var(--brand-dark-blue))]"
              : "bg-muted-foreground/30 cursor-not-allowed"
          }`}
        >
          {submitting ? "Verifica…" : "Verifica"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
