/**
 * Mapping helpers to align internal values with the external API contract.
 */

const ACTIVITY_MAP: Record<string, string> = {
  sedentary: "Sedentario",
  light: "Leggermente attivo",
  moderate: "Moderatamente attivo",
  active: "Attivo",
  very_active: "Molto attivo",
};

const ACTIVITY_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(ACTIVITY_MAP).map(([k, v]) => [v, k])
);

const GENDER_MAP: Record<string, string> = {
  male: "M",
  female: "F",
  other: "Other",
};

const GENDER_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(GENDER_MAP).map(([k, v]) => [v, k])
);

const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export function toApiActivity(internal: string): string {
  return ACTIVITY_MAP[internal] ?? internal;
}

export function fromApiActivity(api: string): string {
  return ACTIVITY_REVERSE[api] ?? api;
}

export function toApiGender(internal: string): string {
  return GENDER_MAP[internal] ?? internal;
}

export function fromApiGender(api: string): string {
  return GENDER_REVERSE[api] ?? api;
}

export function toApiMealType(internal: string): string {
  return MEAL_TYPE_MAP[internal] ?? internal;
}
