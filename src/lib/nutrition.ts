type Sex = "male" | "female";

interface TDEEInput {
  sex: Sex;
  weight: number; // kg
  height: number; // cm
  age: number; // years
  activityLevel: string;
}

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Mifflin-St Jeor equation for BMR, then multiplied by activity factor.
 */
export function calculateTDEE({ sex, weight, height, age, activityLevel }: TDEEInput): number {
  const bmr =
    sex === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.55;
  return Math.round(bmr * multiplier);
}

interface MacroTargets {
  kcal: number;
  protein: number; // grams
  carbs: number;
  fat: number;
}

/**
 * Macro split: 30% protein, 40% carbs, 30% fat
 */
export function calculateMacros(tdee: number): MacroTargets {
  return {
    kcal: tdee,
    protein: Math.round((tdee * 0.3) / 4),
    carbs: Math.round((tdee * 0.4) / 4),
    fat: Math.round((tdee * 0.3) / 9),
  };
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}
