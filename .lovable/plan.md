

## Fix: `recipe_categories_id` invia il nome stringa anziché l'ID numerico

### Problema
In `MyProducts.tsx`, le categorie di default (Antipasti, Primi, ecc.) non hanno `apiId` se il backend non le restituisce da `/api/app/recipe_categories/get` con un nome che corrisponde esattamente. Il fallback è `selectedCategory.label` (stringa), che finisce come `recipe_categories_id: "Antipasti"` invece di un ID numerico.

### Soluzione
1. **`src/pages/MyProducts.tsx`**:
   - Nella riga 399, rimuovere il fallback a `selectedCategory.label`. Usare solo `selectedCategory.apiId ?? selectedCategory.id`.
   - In `RecipeForm` / `RecipeList`, se `categoryId` è `undefined` o non numerico, disabilitare il pulsante "Crea Ricetta" e mostrare un messaggio che la categoria non è ancora sincronizzata con il backend.
   - Alternativa più robusta: nel `fetchCustomCategories`, se una categoria default non ha un match nel backend, crearla automaticamente con una chiamata a `/api/app/recipe_categories/add` e usare l'ID restituito.

2. **`src/components/recipes/RecipeForm.tsx`**:
   - Aggiungere un controllo: se `category` non è un ID numerico valido, mostrare un toast di errore e non inviare la richiesta.

### Approccio consigliato
L'opzione più user-friendly è l'auto-creazione: quando le categorie vengono caricate e una default non ha match, viene creata automaticamente sul backend e l'`apiId` viene salvato. Così l'utente non vede mai un errore.

### File da modificare
- `src/pages/MyProducts.tsx` — auto-creare categorie default mancanti nel backend e salvare gli `apiId`
- `src/components/recipes/RecipeForm.tsx` — validazione di sicurezza su `category` prima di inviare

