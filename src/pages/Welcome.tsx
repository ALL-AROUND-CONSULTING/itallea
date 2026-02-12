import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthLogo } from "@/components/auth/AuthLogo";

const Welcome = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--brand-blue))] border-t-transparent" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-[100dvh] flex-col justify-between bg-white px-6 py-12">
      {/* Logo area – positioned toward bottom-left like the design */}
      <div className="flex-1" />
      <div className="mb-16">
        <AuthLogo size="lg" className="items-start" />
      </div>

      {/* Bottom CTA */}
      <div className="flex flex-col gap-3 pb-4">
        <Link
          to="/login"
          className="flex h-12 w-full items-center justify-center rounded-full bg-[hsl(var(--brand-blue))] text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-dark-blue))]"
        >
          Login
        </Link>
        <p className="text-center text-sm text-muted-foreground">
          Non hai un account?{" "}
          <Link to="/register" className="font-medium text-[hsl(var(--brand-blue))] hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Welcome;
