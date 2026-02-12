import { useDailyNutrition } from "@/hooks/useDailyNutrition";
import { HomeHeader } from "@/components/dashboard/HomeHeader";
import { DeviceBanner } from "@/components/dashboard/DeviceBanner";
import { CaloriesDonutCard } from "@/components/dashboard/CaloriesDonutCard";
import { GoalsSlide } from "@/components/dashboard/GoalsSlide";
import { WeightSlide } from "@/components/dashboard/WeightSlide";
import { QuickCards } from "@/components/dashboard/QuickCards";
import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

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
    <div className="mx-auto max-w-lg">
      <HomeHeader />
      <div className="py-4">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <DeviceBanner />
            </motion.div>
            <motion.div variants={fadeUp}>
              <CaloriesDonutCard data={nutrition} />
            </motion.div>
            <motion.div variants={fadeUp} className="px-4 space-y-4 mt-4">
              <GoalsSlide data={nutrition} />
              <WeightSlide />
            </motion.div>
            <motion.div variants={fadeUp}>
              <QuickCards />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
