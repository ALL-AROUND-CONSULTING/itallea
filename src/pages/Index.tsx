import { useDailyNutrition } from "@/hooks/useDailyNutrition";
import { HomeHeader } from "@/components/dashboard/HomeHeader";
import { DeviceBanner } from "@/components/dashboard/DeviceBanner";
import { HomeCarousel } from "@/components/dashboard/HomeCarousel";
import { GoalsSlide } from "@/components/dashboard/GoalsSlide";
import { CaloriesDonutCard } from "@/components/dashboard/CaloriesDonutCard";
import { WeightSlide } from "@/components/dashboard/WeightSlide";
import { QuickCards } from "@/components/dashboard/QuickCards";

const Index = () => {
  const { data, isLoading } = useDailyNutrition();

  const defaultData = {
    date: new Date().toISOString().split("T")[0],
    totals: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    targets: { kcal: 2000, protein: 150, carbs: 200, fat: 65 },
    percentages: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    mealTotals: {
      breakfast: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      lunch: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      dinner: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      snack: { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    },
    meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
  };

  const nutrition = data ?? defaultData;

  return (
    <div className="mx-auto flex max-w-lg flex-col" style={{ height: "calc(100dvh - 5rem)", overflowY: "auto", overflowX: "hidden" }}>
      <HomeHeader />
      <div className="flex flex-1 flex-col justify-between gap-2 pb-2">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <DeviceBanner />
            <HomeCarousel>
              <GoalsSlide data={nutrition} />
              <CaloriesDonutCard data={nutrition} />
              <WeightSlide />
            </HomeCarousel>
            <QuickCards />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
