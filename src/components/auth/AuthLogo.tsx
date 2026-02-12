import logoImg from "@/assets/logo-itallea.png";

interface AuthLogoProps {
  size?: "sm" | "lg";
  className?: string;
}

export function AuthLogo({ size = "sm", className = "" }: AuthLogoProps) {
  const isLarge = size === "lg";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src={logoImg}
        alt="Ital Lea"
        className={isLarge ? "h-24" : "h-14"}
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
