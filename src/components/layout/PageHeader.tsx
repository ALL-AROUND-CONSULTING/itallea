import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  showThemeToggle?: boolean;
  showBack?: boolean;
}

export function PageHeader({ title, showThemeToggle = false, showBack = false }: PageHeaderProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="flex items-center gap-2">
        {showBack && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
      </div>
      {showThemeToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Cambia tema"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      )}
    </header>
  );
}
