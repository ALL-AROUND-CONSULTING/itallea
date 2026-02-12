import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Mail, Lock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Register = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--brand-blue))] border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdprAccepted) {
      toast.error("Devi accettare l'informativa sulla privacy per continuare.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Le password non corrispondono.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Controlla la tua email per confermare la registrazione!");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white px-6 py-12">
      {/* Logo */}
      <div className="mb-10 mt-8">
        <AuthLogo size="lg" />
      </div>

      <form onSubmit={handleRegister} className="flex flex-1 flex-col">
        <div className="space-y-4">
          <AuthInput
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            required
            autoComplete="email"
          />
          <AuthInput
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            required
            autoComplete="new-password"
            minLength={6}
          />
          <AuthInput
            id="confirm-password"
            type="password"
            placeholder="Conferma la Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Lock}
            required
            autoComplete="new-password"
            minLength={6}
          />
          <div className="flex items-start space-x-2">
            <Checkbox
              id="gdpr"
              checked={gdprAccepted}
              onCheckedChange={(checked) => setGdprAccepted(checked === true)}
            />
            <Label htmlFor="gdpr" className="text-xs leading-relaxed text-muted-foreground">
              Accetto l'informativa sulla privacy e il trattamento dei miei dati personali ai sensi del GDPR.
            </Label>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <button
            type="submit"
            disabled={submitting || !gdprAccepted}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[hsl(var(--brand-blue))] text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-dark-blue))] disabled:opacity-50"
          >
            {submitting ? "Registrazione…" : "Registrati"}
          </button>

          <SocialLoginButtons />

          <p className="text-center text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Link to="/login" className="font-medium text-[hsl(var(--brand-blue))] hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
