

## Analisi onesta: NO, non funziona al 100%

Ho trovato **due problemi concreti** e **una limitazione importante** da segnalare.

---

### Bug 1: `JSON.stringify` doppio nel lookup-barcode

In `src/pages/Scan.tsx` riga 124, il body viene passato così:

```typescript
body: JSON.stringify({ barcode: code }),
```

Ma `apiClient` già fa `JSON.stringify(body)` dentro `proxyFetch`. Quindi il backend riceve una **stringa escaped** invece di un oggetto JSON. La chiamata lookup-barcode probabilmente **non funziona** per questo motivo.

**Fix**: cambiare in `body: { barcode: code }` (senza `JSON.stringify`).

---

### Bug 2: Il profilo fallback maschera errori

In `AuthContext.tsx` righe 56-72, quando la chiamata a `/api/profile/` fallisce (e fallirà, perché l'endpoint non esiste ancora sul backend della software house), viene usato un **profilo stub hardcoded**. Questo fa sembrare che tutto funzioni, ma in realtà l'utente ha dati finti.

Questo è accettabile come comportamento temporaneo, ma va segnalato.

---

### Limitazione: 7 file usano ancora `supabase.from()` direttamente

Queste operazioni CRUD **non passano dal loro backend** e sono ancora legate a Supabase:

| File | Tabelle Supabase usate |
|------|----------------------|
| `Scan.tsx` | `weighings`, `user_products` |
| `WeighingModal.tsx` | `weighings` |
| `MyProducts.tsx` | `user_products`, `user_recipe_categories` |
| `Profile.tsx` | `profiles` |
| `useWeightLog.ts` | `weight_logs` |
| `useWaterLog.ts` | `water_logs` |
| `useRecipes.ts` | `recipes`, `recipe_ingredients` |

Queste chiamate **funzionano ancora con Supabase**, non con il backend della software house. Finché loro non forniscono gli endpoint corrispondenti, non possono essere migrate.

---

### Piano di fix immediato

1. **Fixare il doppio JSON.stringify** in `Scan.tsx` per `lookup-barcode`
2. Nessun altro fix necessario — le chiamate Supabase continueranno a funzionare fino a quando la software house fornirà gli endpoint REST sostitutivi

---

### Risposta corretta da dare alla software house

Lo status reale è:
- **Login custom** ✅ funzionante (via proxy)
- **Token refresh automatico** ✅ implementato
- **Bearer header injection** ✅ implementato
- **lookup-barcode** 🔴 ha un bug (doppio stringify) da fixare
- **Tutte le altre operazioni CRUD** 🟡 ancora su Supabase, in attesa dei loro endpoint

