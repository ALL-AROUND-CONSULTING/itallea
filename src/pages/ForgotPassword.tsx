import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Email inviata! Controlla la tua casella di posta.");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white px-6 py-12">
      <div className="mb-10 mt-8">
        <AuthLogo size="lg" />
      </div>

      <h1 className="mb-2 text-center text-xl font-bold text-foreground">Recupera Password</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        {sent
          ? "Controlla la tua email per il link di reset"
          : "Inserisci la tua email per ricevere il link di reset"}
      </p>

      {!sent ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <AuthInput
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            autoComplete="email"
            autoFocus
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[hsl(var(--brand-blue))] text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-dark-blue))] disabled:opacity-50"
          >
            {submitting ? "Invio…" : "Invia link di reset"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-[hsl(var(--brand-blue))] hover:underline">
              Torna al login
            </Link>
          </p>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Non hai ricevuto l'email?{" "}
            <button onClick={() => setSent(false)} className="font-medium text-[hsl(var(--brand-blue))] hover:underline">
              Riprova
            </button>
          </p>
          <Link to="/login" className="text-sm font-medium text-[hsl(var(--brand-blue))] hover:underline">
            Torna al login
          </Link>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
