import { Smartphone } from "lucide-react";

interface AuthLogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export function AuthLogo({ size = "sm", className = "" }: AuthLogoProps) {
  const isLarge = size === "lg";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className={`flex items-center gap-2 ${isLarge ? "text-4xl" : "text-2xl"} font-extrabold tracking-tight`}>
        <span className="text-foreground">ITAL</span>
        <Smartphone className={`${isLarge ? "h-8 w-8" : "h-5 w-5"} text-[hsl(var(--brand-blue))]`} />
        <span className="text-foreground">LEA</span>
      </div>
      <p className={`${isLarge ? "text-sm mt-2" : "text-xs mt-1"} text-muted-foreground tracking-wide`}>
        L'equilibrio italia<span className="text-[hsl(142,55%,40%)]">no</span> a portata di app
      </p>
    </div>
  );
}
