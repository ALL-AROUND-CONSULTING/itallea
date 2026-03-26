

## Piano: Allineamento chiamate API alla documentazione ufficiale

Ho confrontato ogni chiamata `apiClient` nel codice con la documentazione PDF ricevuta dalla software house. Ecco tutte le discrepanze trovate e i fix necessari.

---

### Riepilogo discrepanze

```text
Endpoint                    | Campo errato (noi)        | Campo atteso (API)
────────────────────────────┼───────────────────────────┼──────────────────────
/api/updateProfile          | date_of_birth             | birthdate
                            | sex                       | gender (M/F/Other)
                            | current_weight            | weight
                            | activity_level (english)  | activity_level (italiano)
                            | water_goal_ml             | target_water
────────────────────────────┼───────────────────────────┼──────────────────────
/api/app/water_logs/add     | {amount_ml, logged_at}    | {value}
/api/app/water_logs/delete  | {logged_at}               | {} (body vuoto)
/api/app/water_logs/summary | usa total_ml, count       | usa value (array di {date, value})
────────────────────────────┼───────────────────────────┼──────────────────────
/api/app/weight_logs/add    | {weight_kg, logged_at}    | {value}
/api/app/weight_logs/get    | parsa id/weight_kg/logged | parsa id/value/created_at
────────────────────────────┼───────────────────────────┼──────────────────────
/api/app/recipes/add        | category, servings,       | recipe_categories_id (int),
                            | ingredients con kcal/etc  | ingredients solo {product_id, grams}
/api/app/recipes/get        | body {category}           | body {recipe_categories_id}
/api/app/recipes/delete     | {recipe_id}               | {id}
/api/app/recipes/get-detail | {recipe_id}               | {id}
────────────────────────────┼───────────────────────────┼──────────────────────
/api/app/meals/add          | product_id, user_product_ | product_id (int), recipe_id,
                            | id, product_name, kcal..  | meal_type (Title Case), grams
/api/app/meals/delete       | {meal_id}                 | {id}
/api/app/meals/update       | {meal_id, grams, ...}     | {id, grams, ...}
────────────────────────────┼───────────────────────────┼──────────────────────
/api/app/products/update    | {product_id, ...}         | {id, ...}
/api/app/products/delete    | {product_id}              | {id}
────────────────────────────┼───────────────────────────┼──────────────────────
/api/app/recipe_categories  |                           |
  /add                      | {name, icon}              | {name}
  /delete                   | {category_id}             | {id}
────────────────────────────┼───────────────────────────┼──────────────────────
/api/app/meals/summary      | meal_type lowercase       | Capitalized (Breakfast, Lunch...)
                            | item.product_name         | item.name (API field)
```

---

### File da modificare

1. **`src/pages/Onboarding.tsx`** — Rinominare i campi del body di updateProfile: `date_of_birth` → `birthdate`, `sex` → `gender` (con mapping M/F/Other), `current_weight` → `weight`, `activity_level` → valore italiano, `water_goal_ml` → `target_water`. Rimuovere `avatar_url` e `onboarding_completed` se non previsti dall'API.

2. **`src/pages/Profile.tsx`** — Stesso fix di Onboarding per updateProfile.

3. **`src/hooks/useWaterLog.ts`** — `addGlass`: body `{ value: amountMl }` anziché `{ amount_ml, logged_at }`. `removeLastGlass`: body `{}` anziché `{ logged_at }`. Query summary: leggere `value` anziché `total_ml`.

4. **`src/hooks/useWeightLog.ts`** — `logWeight`: body `{ value: weightKg }` anziché `{ weight_kg, logged_at }`. History parsing: leggere `value` e `created_at` anziché `weight_kg` e `logged_at`.

5. **`src/hooks/useRecipes.ts`** — `createRecipe`: inviare `recipe_categories_id` (int) anziché `category` (string), rimuovere `servings`, ingredienti come `{ product_id, grams }` senza kcal/protein/etc. `deleteRecipe`: `{ id }` anziché `{ recipe_id }`. `fetchRecipeWithIngredients`: `{ id }` anziché `{ recipe_id }`. `fetchRecipes`: usare `recipe_categories_id` anziché `category`.

6. **`src/components/weighing/WeighingModal.tsx`** — meals/add: inviare solo `{ product_id, recipe_id: null, meal_type, grams }`. Rimuovere `user_product_id`, `product_name`, `kcal`, `protein`, `carbs`, `fat`. Capitalizzare meal_type.

7. **`src/pages/Scan.tsx`** — Stesso fix di WeighingModal per meals/add.

8. **`src/pages/Diary.tsx`** — meals/delete: `{ id }` anziché `{ meal_id }`.

9. **`src/components/weighing/EditWeighingModal.tsx`** — meals/update: `{ id }` anziché `{ meal_id }`, inviare solo `{ id, grams, meal_type }`, rimuovere kcal/protein/carbs/fat.

10. **`src/pages/MyProducts.tsx`** — products/update: `{ id, ... }` anziché `{ product_id, ... }`. products/delete: `{ id }` anziché `{ product_id }`. recipe_categories/add: rimuovere `icon`. recipe_categories/delete: `{ id }` anziché `{ category_id }`.

11. **`src/hooks/useDailyNutrition.ts`** — Il parsing è già compatibile (gestisce chiavi capitalized). Verificare che `item.name` viene letto correttamente dalla risposta API.

12. **`src/hooks/useWaterHistory.ts`** — Aggiornare il parsing della risposta summary per leggere `value` anziché `total_ml`.

---

### Mapping activity_level

Il backend richiede valori in italiano. Creare un mapping:

```text
sedentary    → "Sedentario"
light        → "Leggermente attivo"
moderate     → "Moderatamente attivo"
active       → "Attivo"
very_active  → "Molto attivo"
```

### Mapping gender

```text
male   → "M"
female → "F"
other  → "Other"
```

---

### Dettaglio tecnico: trailing slash

Tutti gli endpoint nella documentazione sono senza trailing slash. Il fix precedente di non strippare lo slash resta valido, ma tutti i path nel codice dovrebbero essere allineati al formato documentato (senza slash finale) per evitare redirect 301.

