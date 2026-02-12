import { useNavigate } from "react-router-dom";
import { AuthLogo } from "@/components/auth/AuthLogo";

const PostVerify = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-white px-6 overflow-hidden">
      {/* Confetti decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Scattered confetti dots */}
        <div className="absolute left-[10%] top-[15%] h-3 w-3 rotate-12 rounded-sm bg-[hsl(var(--brand-blue))]/30" />
        <div className="absolute right-[15%] top-[10%] h-2.5 w-2.5 -rotate-45 rounded-full bg-amber-300/50" />
        <div className="absolute left-[20%] top-[25%] h-2 w-5 rotate-45 rounded-full bg-emerald-300/40" />
        <div className="absolute right-[25%] top-[20%] h-2 w-2 rotate-12 rounded-sm bg-rose-300/40" />
        <div className="absolute left-[8%] bottom-[30%] h-2.5 w-2.5 -rotate-12 rounded-full bg-[hsl(var(--brand-blue))]/20" />
        <div className="absolute right-[10%] bottom-[25%] h-3 w-3 rotate-45 rounded-sm bg-amber-200/40" />
        <div className="absolute left-[30%] bottom-[20%] h-2 w-4 -rotate-30 rounded-full bg-violet-300/30" />
        <div className="absolute right-[30%] bottom-[35%] h-2 w-2 rotate-90 rounded-sm bg-emerald-200/40" />
        <div className="absolute left-[50%] top-[8%] h-2 w-3 rotate-12 rounded-full bg-rose-200/30" />
        <div className="absolute right-[40%] bottom-[15%] h-3 w-3 -rotate-45 rounded-full bg-[hsl(var(--brand-blue))]/15" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="mb-8 text-lg font-medium text-foreground">
          Benvenuto/a nella tua nuova app:
        </p>

        <AuthLogo size="lg" className="mb-8" />

        <p className="mb-12 max-w-[280px] text-sm text-muted-foreground leading-relaxed">
          Completa la registrazione per poterti offrire i nostri migliori servizi
        </p>

        <button
          onClick={() => navigate("/onboarding", { replace: true })}
          className="flex h-12 w-full max-w-[280px] items-center justify-center rounded-full bg-[hsl(var(--brand-blue))] text-sm font-semibold text-white transition-colors hover:bg-[hsl(var(--brand-dark-blue))]"
        >
          Iniziamo!
        </button>
      </div>
    </div>
  );
};

export default PostVerify;
