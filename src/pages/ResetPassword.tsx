import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("La password deve avere almeno 6 caratteri");
      return;
    }
    if (password !== confirm) {
      toast.error("Le password non corrispondono");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password aggiornata con successo!");
      navigate("/login", { replace: true });
    }
    setSubmitting(false);
  };

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center bg-white px-6 py-12">
        <div className="mb-10 mt-8">
          <AuthLogo size="lg" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">Reset Password</h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Caricamento in corso… Se non succede nulla, il link potrebbe essere scaduto.
        </p>
        <button
          onClick={() => navigate("/forgot-password")}
          className="flex h-12 w-full max-w-xs items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Richiedi un nuovo link
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white px-6 py-12">
      <div className="mb-10 mt-8">
        <AuthLogo size="lg" />
      </div>

      <h1 className="mb-2 text-center text-xl font-bold text-foreground">Nuova Password</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">Scegli la tua nuova password</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthInput
          id="password"
          type="password"
          placeholder="Nuova password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={Lock}
          required
          minLength={6}
          autoFocus
        />
        <AuthInput
          id="confirm"
          type="password"
          placeholder="Conferma password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          icon={Lock}
          required
          minLength={6}
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-[hsl(var(--brand-blue))] text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-dark-blue))] disabled:opacity-50"
        >
          {submitting ? "Aggiornamento…" : "Aggiorna password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
