import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { useDailyNutrition } from "@/hooks/useDailyNutrition";
import { GoalsSlide } from "@/components/dashboard/GoalsSlide";
import { MealCaloriesSlide } from "@/components/dashboard/MealCaloriesSlide";
import { WeightSlide } from "@/components/dashboard/WeightSlide";
import { PageHeader } from "@/components/layout/PageHeader";

const Index = () => {
  const { data, isLoading } = useDailyNutrition();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

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
    <>
      <PageHeader title="🍽️ Ital Lea" showThemeToggle />
      <div className="mx-auto max-w-lg px-2 py-4">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                <div className="min-w-0 flex-[0_0_100%]">
                  <GoalsSlide data={nutrition} />
                </div>
                <div className="min-w-0 flex-[0_0_100%]">
                  <MealCaloriesSlide data={nutrition} />
                </div>
                <div className="min-w-0 flex-[0_0_100%]">
                  <WeightSlide />
                </div>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    selectedIndex === i
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30"
                  )}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Index;
