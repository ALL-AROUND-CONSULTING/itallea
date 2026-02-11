

# 🍽️ ITAL LEA — Piano Esecutivo (Schema Incrementale)

Ogni fase crea SOLO le tabelle necessarie. Approccio MVP-first, architettura pronta per le iterazioni post-MVP senza refactoring.

---

## MVP Fase A — Fondamenta (Setup + Auth + Profilo)

### Step A1: Supabase + Schema Base
- Attivazione Lovable Cloud
- Tabelle create in questa fase:
  - `profiles` (nome, cognome, data nascita, sesso, peso, altezza, peso obiettivo, attività, target kcal/proteine/carbo/grassi, onboarding_completed, tema, avatar_url)
  - `user_roles` (tabella separata per ruoli admin — solo schema, nessun utente admin per ora)
- Funzione helper `has_role()` (security definer)
- Trigger `on_auth_user_created` → auto-creazione profilo
- RLS su profiles e user_roles

### Step A2: Layout App & Navigazione
- Layout mobile-first (375px-428px)
- Bottom navigation bar: Home, Diario, Scan, Grafici, Profilo
- Header con logo
- Routing per tutte le pagine (alcune placeholder)
- Tema chiaro/scuro con toggle

### Step A3: Autenticazione
- Login (email + password)
- Registrazione con checkbox GDPR
- Verifica email
- AuthContext globale
- Route protette + redirect a onboarding se profilo incompleto

### Step A4: Onboarding Wizard (3 step)
- Step 1: Nome, cognome, data nascita, sesso
- Step 2: Peso, altezza, peso obiettivo
- Step 3: Livello attività (5 opzioni)
- Progress bar animata
- Calcolo TDEE e macro target al completamento
- Salvataggio profilo + flag onboarding_completed

### Step A5: Pagina Profilo
- Form editabile dati personali
- Ricalcolo target se cambiano valori
- Toggle tema
- Sezioni placeholder per bilancia, export, elimina account

---

## MVP Fase B — Home & Tracking Nutrizionale

### Step B1: Nuove tabelle
- `products` (nome, marca, barcode, kcal, proteine, carbo, grassi, fibre, sale per 100g, source, immagine_url)
- `user_products` (stessa struttura, con user_id — alimenti personali)
- `weighings` (user_id, product_id/user_product_id, grams, meal_type, kcal/proteine/carbo/grassi calcolati, data)
- RLS su tutte

### Step B2: Edge Function Aggregazione
- `get-daily-nutrition`: somma pesate del giorno, breakdown per pasto, percentuali vs target

### Step B3: Home Dashboard (3 slide swipe)
- Slide 1 — Obiettivi: 4 cerchi progresso animati (kcal, P, C, G)
- Slide 2 — Calorie per pasto: barre orizzontali per colazione/pranzo/cena/snack
- Slide 3 — Peso: valore attuale, target, differenza

### Step B4: Barra Azioni + Pesata Manuale
- Barra sticky: Scan, Nuova Pesata, Diario
- Modale pesata: ricerca fuzzy alimenti, input grammi, preview nutrienti live, selettore pasto, salvataggio

### Step B5: Diario Alimentare
- Navigazione tra giorni
- 4 sezioni espandibili per pasto
- Eliminazione singola voce
- Totali giornalieri sticky

---

## MVP Fase C — Barcode & Alimenti Personali

### Step C1: Edge Function `lookup-barcode`
- Riceve barcode → cerca in `products` → fallback Open Food Facts API
- Se trovato su OFF: salva in products e ritorna
- Se non trovato: ritorna 404

### Step C2: Scanner Barcode
- Pagina con viewfinder fotocamera (html5-qrcode)
- Risultato: modale con valori nutrizionali, input grammi, selettore pasto, salva
- Non trovato: link a inserimento manuale

### Step C3: I Miei Prodotti (CRUD)
- Lista con ricerca
- Form creazione/modifica (nome, marca, barcode, tutti i valori nutrizionali)
- Eliminazione con conferma
- Integrati nella ricerca pesata manuale

---

## MVP Fase D — Idratazione, Peso & Grafici

### Step D1: Nuove tabelle
- `water_logs` (user_id, ml, timestamp)
- `weight_logs` (user_id, weight_kg, date — unique per user+giorno)
- RLS su entrambe

### Step D2: Tracking Idratazione
- Anello circolare SVG animato
- 5 pulsanti rapidi (250ml, 500ml, 700ml, 1L, 1.5L)
- Obiettivo personalizzabile (default 2000ml)
- Mini-badge in home dashboard

### Step D3: Tracking Peso
- Input peso giornaliero (UPSERT)
- Aggiornamento current_weight nel profilo
- Feedback +/- rispetto a ieri

### Step D4: Pagina Grafici
- Selettore periodo: 7gg, 30gg, 90gg
- Grafico calorie vs target (barre + linea)
- Grafico trend peso (linea + target orizzontale)
- Grafico idratazione (barre + linea obiettivo)
- Recharts, responsive, tooltip al tap

---

## Post-MVP — Iterazioni (tabelle create al bisogno)

### Iterazione 1: Ricettario
- Crea tabelle `recipes` + `recipe_ingredients`
- CRUD ricette, calcolo nutrienti, "consuma ricetta"

### Iterazione 2: OCR Etichetta
- Edge Function con Google Vision API
- Scansione → parsing → form pre-compilato → salva in user_products

### Iterazione 3: Pairing Bilancia
- Crea tabelle `devices` + `device_profiles`
- Scanner QR, Edge Functions per bilancia, Supabase Realtime

### Iterazione 4: Dashboard Admin
- Crea tabella `notifications` + `product_submissions`
- Gestione utenti, moderazione alimenti, invio notifiche

### Iterazione 5: Notifiche In-App
- Polling su tabella notifications
- Campanella con badge, lista read/unread

### Iterazione 6: GDPR & Polish
- Edge Function export dati JSON/CSV
- Eliminazione account con cascade
- PWA manifest

