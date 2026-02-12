import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLogo } from "@/components/auth/AuthLogo";
import { AuthInput } from "@/components/auth/AuthInput";
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--brand-blue))] border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-white px-6 py-12">
      {/* Logo */}
      <div className="mb-10 mt-8">
        <AuthLogo size="lg" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-1 flex-col">
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
            autoComplete="current-password"
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-[hsl(var(--brand-blue))] hover:underline">
              Password dimenticata?
            </Link>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5">
          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[hsl(var(--brand-blue))] text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-dark-blue))] disabled:opacity-50"
          >
            {submitting ? "Accesso…" : "Login"}
          </button>

          <SocialLoginButtons />

          <p className="text-center text-sm text-muted-foreground">
            Non hai un account?{" "}
            <Link to="/register" className="font-medium text-[hsl(var(--brand-blue))] hover:underline">
              Registrati
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
