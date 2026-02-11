import { PageHeader } from "@/components/layout/PageHeader";

const Index = () => {
  return (
    <>
      <PageHeader title="Ital Lea" showThemeToggle />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">🍽️ Bentornato!</h2>
          <p className="mt-2 text-muted-foreground">La tua dashboard sarà qui.</p>
        </div>
      </div>
    </>
  );
};

export default Index;
