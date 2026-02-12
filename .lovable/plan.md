

# Audit Completo e Stato di Avanzamento - Ital Lea

## 1. Panoramica Generale

L'applicazione Ital Lea e' una piattaforma di tracciamento nutrizionale costruita con React + Vite + Tailwind CSS, con backend Lovable Cloud (Supabase). Il sistema include: app utente (PWA), pannello admin, e API per bilancia hardware.

---

## 2. Stato delle Funzionalita' rispetto al Documento Tecnico

### COMPLETATE (funzionanti e testate)

| Funzionalita' | Stato | Note |
|---|---|---|
| Registrazione e Login (email/password) | OK | Con verifica email OTP |
| SSO Google | OK | Funzionante via Lovable Cloud |
| SSO Apple | OK | Integrato via `lovable.auth.signInWithOAuth("apple")` |
| Onboarding 4 step | OK | Nome, misurazioni, attivita', foto/telefono |
| Home con carosello (obiettivi, calorie, peso, acqua) | OK | Slide interattive |
| Diario alimentare per giorno | OK | Con navigazione date, edit/delete pesate |
| Scanner barcode + inserimento manuale | OK | Camera nativa + fallback manuale |
| Lookup barcode (endpoint) | OK | Cerca in DB locale poi Open Food Facts |
| Calcolo calorie giornaliere (endpoint) | OK | `get-daily-nutrition` funzionante |
| Profilo utente con modifica dati | OK | Ricalcolo TDEE automatico |
| Pagina Impostazioni separata | OK | Tema, bilancia, export, delete account, admin |
| Grafici (calorie, macro, peso, acqua) | OK | Con range 7G/1M/3M/6M |
| Idratazione con preset acqua | OK | Icone corrette (acqua, non caffe') |
| Peso corporeo (log e storico) | OK | Con modifica e grafico |
| I miei prodotti | OK | CRUD alimenti personali |
| Ricette (ricettario) | OK | CRUD con ingredienti e calcolo |
| Export dati utente (endpoint) | OK | JSON scaricabile |
| Elimina account (endpoint) | OK | Con cascade su tutti i dati |
| Pairing bilancia (endpoint) | OK | QR/codice manuale |
| Bilancia: lookup barcode (endpoint) | OK | `device-lookup-barcode` |
| Bilancia: invio pesata (endpoint) | OK | `device-send-weighing` |
| Bilancia: get ricetta (endpoint) | OK | `device-get-recipe` |
| OCR etichetta nutrizionale (endpoint) | OK | `ocr-nutrition-label` |
| Submission correzione nutrizionale | OK | `submit-nutrition-correction` |
| Admin: gestione utenti (lista, elimina) | OK | Funzionante, testato |
| Admin: log pasti utente | OK | Modale con pesate raggruppate per data |
| Admin: gestione notifiche (invio + storico) | OK | Form completo con titolo/messaggio/URL |
| Admin: gestione KO alimenti (proposte) | OK | Approva/rifiuta/crea prodotto globale |
| Tema chiaro/scuro | OK | Switch in Impostazioni |
| PWA configurata | OK | Con manifest, icone, service worker |
| OAuth denylist nel service worker | OK | `/~oauth` escluso correttamente |
| Multi-tenant (isolamento dati) | OK | RLS su tutte le tabelle con `auth.uid()` |

### DA COMPLETARE

| Funzionalita' | Stato | Dettaglio |
|---|---|---|
| SSO Facebook | NON SUPPORTATO | Lovable Cloud non supporta Facebook OAuth. Solo Google e Apple disponibili |
| Notifiche Push reali (FCM) | NON IMPLEMENTATO | L'endpoint `admin-send-notification` salva le notifiche nel DB ma non le invia realmente via push. Serve configurazione Firebase (VAPID key + FCM Server Key) e registrazione Service Worker per push |
| Multi-profilo bilancia | PARZIALE | Il documento prevede che la bilancia possa avere piu' profili subordinati a un admin. Attualmente il sistema supporta 1 utente = 1 account isolato. La bilancia invia dati per `hardware_device_id` ma la gestione multi-profilo a livello bilancia (profili secondari senza account app) non e' implementata |

---

## 3. Bug e Problemi Trovati

### Bug 1 - Admin Meals: chiamata duplicata inutile
In `AdminUsers.tsx` riga 82-86, `handleViewMeals` fa una prima chiamata GET senza userId (inutile, scarta il risultato) prima di fare quella corretta con query param. Spreco di una request.

### Bug 2 - Admin Meals: query param nel path
La chiamata `supabase.functions.invoke("admin-manage-users?userId=...")` potrebbe non funzionare con tutte le versioni del client Supabase. E' un workaround fragile per passare query params.

### Bug 3 - Diary water icons incoerenti
Nel Diary (`src/pages/Diary.tsx` righe 221-226) i preset acqua usano ancora icone generiche (bottiglia di latte, barattolo) diverse da quelle nella pagina Hydration che sono state aggiornate.

### Bug 4 - Charts: cast `(profile as any)`
In `Charts.tsx` il profilo viene castato come `any` per accedere a `target_kcal`, `target_protein`, ecc. Questi campi non sono nel tipo `Profile` definito in `AuthContext`. Funziona ma e' fragile.

---

## 4. Sicurezza

### Punti di forza
- RLS abilitato su tutte le tabelle
- Tutte le policy usano `auth.uid()` o `has_role()` (SECURITY DEFINER)
- Ruoli in tabella separata `user_roles` (non nel profilo)
- Edge functions verificano admin via `has_role` RPC
- Password gestite da Supabase Auth (bcrypt)
- HTTPS su tutte le comunicazioni
- CORS headers presenti su tutte le edge functions

### Punti di attenzione
- Tutte le edge functions hanno `verify_jwt = false` nel config.toml. Questo e' intenzionale perche' la verifica JWT viene fatta manualmente nel codice delle funzioni, ma sarebbe piu' sicuro abilitare `verify_jwt = true` dove possibile
- Le funzioni device (`device-lookup-barcode`, `device-send-weighing`) non richiedono JWT perche' la bilancia non ha sessioni utente - usano `hardware_device_id` per identificare il dispositivo

---

## 5. Architettura e Solidita'

### Database: 12 tabelle ben strutturate
`profiles`, `weighings`, `water_logs`, `weight_logs`, `products`, `user_products`, `recipes`, `recipe_ingredients`, `devices`, `user_roles`, `notifications`, `product_submissions`, `push_tokens`

### Edge Functions: 13 funzioni
Tutte deployate e funzionanti. Coprono tutti gli endpoint specificati nel documento tecnico.

### Frontend: ben organizzato
- Componenti modulari e riutilizzabili
- Hook custom per logica di business (`useDailyNutrition`, `useWaterLog`, `useWeightLog`, ecc.)
- Context per autenticazione
- React Query per caching e invalidazione

### Scalabilita'
- Il backend Supabase scala automaticamente
- RLS garantisce isolamento dati senza logica applicativa
- Nessun bottleneck architetturale evidente

---

## 6. Piano di Implementazione per i Punti Mancanti

### Fase 1: Fix bug (rapido)
1. Rimuovere la chiamata GET duplicata in `handleViewMeals`
2. Allineare le icone acqua nel Diary con quelle della pagina Hydration
3. Estendere il tipo `Profile` in AuthContext per includere i campi target

### Fase 2: Notifiche Push Reali (richiede Firebase)
1. Creare un progetto Firebase e ottenere la VAPID key e il Server Key FCM
2. Configurare i secret nel backend (`FIREBASE_SERVER_KEY` o credenziali)
3. Implementare la registrazione del Service Worker per le push notification nel frontend
4. Aggiornare `admin-send-notification` per inviare realmente via FCM usando i token dalla tabella `push_tokens`
5. Aggiornare `manage-push-token` per salvare/eliminare i token alla login/logout

### Fase 3: Multi-profilo bilancia (opzionale, architettura complessa)
Questo richiederebbe una tabella `device_profiles` per gestire sotto-profili associati alla bilancia senza account app individuale. E' una feature avanzata che potrebbe essere rimandata a una fase successiva.

---

## 7. Valutazione Complessiva

| Criterio | Voto |
|---|---|
| Completezza rispetto al documento | 90% |
| Sicurezza | Solida |
| Architettura | Ben strutturata |
| UX/UI | Coerente e pulita |
| Stabilita' endpoint | Tutti funzionanti |
| Pronto per produzione | Si, dopo fix bug minori e configurazione FCM |

L'applicazione e' in ottimo stato. I 3 bug trovati sono minori e non bloccanti. L'unica feature significativa mancante sono le notifiche push reali (che richiedono credenziali Firebase dal cliente) e il supporto Facebook SSO (non disponibile sulla piattaforma). Il multi-profilo bilancia e' una feature avanzata che puo' essere implementata in una fase successiva.

---

## Sezione Tecnica - Dettaglio Modifiche

### Fix 1: AdminUsers.tsx - Rimuovere chiamata duplicata
Eliminare le righe 82-86 (la chiamata GET senza userId che scarta il risultato).

### Fix 2: Diary.tsx - Allineare icone acqua
Sostituire le icone water preset (righe 221-226) con le stesse usate in Hydration.tsx (acqua-themed).

### Fix 3: AuthContext.tsx - Estendere tipo Profile
Aggiungere `target_kcal`, `target_protein`, `target_carbs`, `target_fat`, `target_weight` al tipo `Profile` e al select del `fetchProfile`.

### Fix 4: Charts.tsx - Rimuovere cast `as any`
Dopo aver esteso il tipo Profile, rimuovere i cast `(profile as any)`.

