

## Analisi documentazione API della Software House e piano di implementazione

### Cosa hanno fornito

La software house ha implementato una prima versione completa delle API, raggiungibili su `https://api.itallea.b4web.biz/`. Il documento copre **11 aree** con tutti gli endpoint necessari.

---

### Mappatura completa: Endpoint forniti vs. Codice attuale

| # | Area | Endpoint fornito | Stato attuale nel codice | Azione |
|---|------|-----------------|-------------------------|--------|
| 1 | **Registrazione** | `POST /api/register` | Usa `supabase.auth.signUp` in `Register.tsx` | Riscrivere |
| 2 | **Verifica email** | `POST /api/register/verify` | Usa `supabase.auth.verifyOtp` in `VerifyEmail.tsx` | Riscrivere |
| 3 | **Reinvio codice** | `POST /api/register/resend` | Usa `supabase.auth.resend` in `VerifyEmail.tsx` | Riscrivere |
| 4 | **Login** | `POST /oauth/token` | ✅ Già migrato in `authService.ts` — **MA** mancano `grant_type`, `client_id`, `client_secret`, `scope` | Fix body |
| 5 | **Logout** | `POST /api/logout` | Solo `clearTokens()` locale | Aggiungere chiamata API |
| 6 | **Profilo GET** | `POST /api/app/vw_profiles/get` | Chiama `/api/profile/` (sbagliato) | Fix path |
| 7 | **Profilo UPDATE** | `POST /api/updateProfile` | Usa `supabase.from("profiles")` in `Profile.tsx` | Riscrivere |
| 8 | **Barcode lookup** | `POST /api/lookup-barcode` | ✅ Già migrato — path leggermente diverso (trailing slash) | Verificare |
| 9 | **Water logs GET** | `POST /api/app/water_logs/summary` | Usa `supabase.from("water_logs")` | Riscrivere |
| 10 | **Water logs ADD** | `POST /api/app/water_logs/add` | Usa `supabase.from("water_logs")` | Riscrivere |
| 11 | **Water logs DELETE** | `POST /api/app/water_logs/delete-last` | Usa `supabase.from("water_logs")` | Riscrivere |
| 12 | **Weight logs GET** | `POST /api/app/weight_logs/get` | Usa `supabase.from("weight_logs")` | Riscrivere |
| 13 | **Weight logs ADD** | `POST /api/app/weight_logs/add` | Usa `supabase.from("weight_logs")` | Riscrivere |
| 14 | **Products GET** | `POST /api/app/products/get` | Usa `supabase.from("user_products")` | Riscrivere |
| 15 | **Products ADD** | `POST /api/app/products/add` | Usa `supabase.from("user_products")` | Riscrivere |
| 16 | **Products UPDATE** | `POST /api/app/products/update` | Usa `supabase.from("user_products")` | Riscrivere |
| 17 | **Products DELETE** | `POST /api/app/products/delete` | Usa `supabase.from("user_products")` | Riscrivere |
| 18 | **Recipe categories CRUD** | `/api/app/recipe_categories/*` | Usa `supabase.from("user_recipe_categories")` | Riscrivere |
| 19 | **Recipes CRUD** | `/api/app/recipes/*` | Usa `supabase.from("recipes")` | Riscrivere |
| 20 | **Recipe detail** | `POST /api/app/recipes/get-detail` | Usa `supabase.from("recipe_ingredients")` | Riscrivere |
| 21 | **Meals ADD** | `POST /api/app/meals/add` | Usa `supabase.from("weighings")` | Riscrivere |
| 22 | **Meals summary** | `POST /api/app/meals/summary` | Chiama `/api/get-daily-nutrition/` | Fix path + formato |

---

### Differenze critiche rispetto al codice attuale

**1. Login — body incompleto**
Il codice attuale invia `{ username, password }`. La documentazione richiede:
```json
{
  "grant_type": "password",
  "client_id": "{{client_id}}",
  "client_secret": "{{client_secret}}",
  "username": "...",
  "password": "...",
  "scope": "*"
}
```
Servono `client_id` e `client_secret` dalla software house.

**2. Proxy — URL base cambiato**
Il proxy punta a `https://italea.test.b4web.biz` ma il nuovo URL è `https://api.itallea.b4web.biz/`.

**3. Tutti i metodi sono POST**
La loro API usa POST per tutto (anche le GET), con body JSON. Il nostro `apiClient` supporta già questo pattern.

**4. Formato risposta lookup-barcode diverso**
Loro restituiscono `{ source, record: {...} }` invece di `{ found, source, product: {...} }`. Il campo è `record`, non `product`.

**5. Meals summary diverso da daily-nutrition**
Path: `/api/app/meals/summary` (non `/api/get-daily-nutrition/`). Body: `{ start_date, end_date }` (non `{ date }`). Risposta: array di giorni con `meals.Breakfast/Lunch/Dinner/Snack` (maiuscolo).

---

### Piano di implementazione (ordinato per priorità)

**Fase 1 — Infrastruttura (prerequisito)**
1. Aggiornare `BACKEND_BASE_URL` nel proxy da `https://italea.test.b4web.biz` a `https://api.itallea.b4web.biz`
2. Chiedere alla software house `client_id` e `client_secret` per il login OAuth
3. Aggiornare `authService.ts` per includere `grant_type`, `client_id`, `client_secret`, `scope` nel body di login

**Fase 2 — Autenticazione completa**
4. Riscrivere `Register.tsx` per chiamare `POST /api/register` via `apiClient`
5. Riscrivere `VerifyEmail.tsx` per chiamare `POST /api/register/verify` (la verify restituisce i token OAuth, quindi fare auto-login)
6. Aggiungere reinvio codice via `POST /api/register/resend`
7. Aggiornare logout per chiamare `POST /api/logout` prima di pulire i token locali
8. Riscrivere `ForgotPassword.tsx` (nota: la documentazione NON include un endpoint di reset password — da chiedere alla software house)

**Fase 3 — Profilo**
9. Fix path profilo GET: da `/api/profile/` a `POST /api/app/vw_profiles/get`
10. Riscrivere aggiornamento profilo per usare `POST /api/updateProfile`

**Fase 4 — CRUD dati (sgancio completo da Supabase)**
11. Riscrivere `useWaterLog.ts` per usare `/api/app/water_logs/summary`, `/add`, `/delete-last`
12. Riscrivere `useWaterHistory.ts` per usare `/api/app/water_logs/summary` con range date
13. Riscrivere `useWeightLog.ts` per usare `/api/app/weight_logs/get` e `/add`
14. Riscrivere `MyProducts.tsx` per usare `/api/app/products/*`
15. Riscrivere `useRecipes.ts` per usare `/api/app/recipes/*` e `/api/app/recipe_categories/*`
16. Riscrivere le pesate (meals) in `Scan.tsx` e `WeighingModal.tsx` per usare `POST /api/app/meals/add`
17. Riscrivere `useDailyNutrition.ts` per usare `POST /api/app/meals/summary`

**Fase 5 — Fix risposte**
18. Adattare il parsing di `lookup-barcode` al nuovo formato `{ source, record }` invece di `{ found, product }`

---

### Domande aperte per la software house

Prima di procedere, servono risposte su:

1. **`client_id` e `client_secret`** — quali valori usare per il login OAuth?
2. **Reset password** — non c'è un endpoint nella documentazione. Esiste?
3. **Eliminazione pasto** — c'è un endpoint per eliminare un pasto registrato? (es. `DELETE /api/app/meals/delete`)
4. **Aggiornamento pasto** — si può modificare un pasto già inserito?
5. **Export dati / Eliminazione account** — endpoint previsti?
6. **CORS** — il nuovo server `api.itallea.b4web.biz` ha gli header CORS abilitati? Se sì, possiamo rimuovere il proxy.

---

### File coinvolti nel refactor

```text
Infrastruttura:
  supabase/functions/backend-proxy/index.ts  → nuovo URL base
  src/lib/authService.ts                     → body login completo
  src/lib/apiClient.ts                       → nessuna modifica
  src/contexts/AuthContext.tsx                → fix path profilo + logout API

Auth pages:
  src/pages/Register.tsx                     → riscrittura completa
  src/pages/VerifyEmail.tsx                  → riscrittura completa  
  src/pages/ForgotPassword.tsx               → dipende da endpoint mancante

Hooks da riscrivere:
  src/hooks/useWaterLog.ts                   → apiClient
  src/hooks/useWaterHistory.ts               → apiClient
  src/hooks/useWeightLog.ts                  → apiClient
  src/hooks/useDailyNutrition.ts             → nuovo path + formato
  src/hooks/useRecipes.ts                    → apiClient

Pages da aggiornare:
  src/pages/Scan.tsx                         → fix formato risposta + meals/add
  src/pages/MyProducts.tsx                   → apiClient per products
  src/pages/Profile.tsx                      → apiClient per profilo
  src/components/weighing/WeighingModal.tsx   → meals/add
```

Totale: ~15 file da modificare, di cui 2 riscritture complete (Register, VerifyEmail) e 10+ adattamenti di path/formato.

