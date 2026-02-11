import { ChevronRight, Scale } from "lucide-react";

export function DeviceBanner() {
  return (
    <div className="mx-4 -mt-2 mb-4">
      <div
        className="rounded-2xl p-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--brand-dark-blue)), hsl(var(--brand-blue)))",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-semibold text-white">
                Il mio dispositivo
                <ChevronRight className="h-4 w-4" />
              </p>
              <p className="text-xs text-white/70">
                Bilancia Ital Lea connessa · N. Serie 0024
              </p>
            </div>
          </div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-400 shadow-sm shadow-green-400/50" />
        </div>
      </div>
    </div>
  );
}
