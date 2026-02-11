import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  showThemeToggle?: boolean;
}

export function PageHeader({ title, showThemeToggle = false }: PageHeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-card/95 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <h1 className="text-lg font-bold tracking-tight text-foreground">{title}</h1>
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
