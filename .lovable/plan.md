

# Analisi Completa: Ital Lea - Stato Attuale vs Relazione Tecnica

## Panoramica Generale

L'app Ital Lea e' una piattaforma di monitoraggio nutrizionale con bilancia smart. Confrontando il documento tecnico (48 pagine) con il codice attuale, l'app e' a buon punto ma ci sono alcune aree ancora da completare o migliorare.

---

## Stato per Sezione

### LATO UTENTE

| Funzionalita' | Stato | Note |
|---|---|---|
| Login con email/password | FATTO | Pagina `/login` completa |
| Registrazione email/password | FATTO | Pagina `/register` completa |
| SSO Google | FATTO | Componente `GoogleSignInButton` presente |
| SSO Facebook | MANCANTE | Il documento prevede anche Facebook e Apple |
| SSO Apple | MANCANTE | Il documento prevede anche Apple |
| Verifica email post-registrazione | FATTO | Pagina `/verify-email` presente |
| Reset password / Forgot password | FATTO | Entrambe le pagine presenti |
| Onboarding (4 step) | FATTO | Nome, cognome, dob, sesso, peso, altezza, target, attivita', telefono, avatar |
| Pagina Welcome | FATTO | Landing page iniziale |

### HOME

| Funzionalita' | Stato | Note |
|---|---|---|
| Header con saluto e nome utente | FATTO | `HomeHeader` |
| Banner dispositivo (aggiungi/connesso) | FATTO | `DeviceBanner` |
| Carosello 3 slide (Obiettivi, Calorie, Peso) | FATTO | `HomeCarousel` con `GoalsSlide`, `CaloriesDonutCard`, `WeightSlide` |
| Card Idratazione (link a pagina dedicata) | FATTO | `QuickCards` con navigazione a `/hydration` |
| Card "Il mio database" (link a ricettario/prodotti) | FATTO | `QuickCards` con navigazione a `/my-products` |

### DIARIO ALIMENTARE

| Funzionalita' | Stato | Note |
|---|---|---|
| Navigazione per data (avanti/indietro) | FATTO | Con navigatore data |
| Suddivisione per pasto (colazione/pranzo/cena/spuntino) | FATTO | Accordion con 4 sezioni |
| Dettaglio per alimento (nome, grammi, kcal, macro) | FATTO | |
| Modifica pesata | FATTO | `EditWeighingModal` |
| Eliminazione pesata | FATTO | Bottone delete con conferma |
| Tracciamento acqua nel diario | FATTO | Sezione acqua con preset rapidi |

### REGISTRAZIONE ALIMENTI (FAB +)

| Funzionalita' | Stato | Note |
|---|---|---|
| Bottom sheet dal FAB (+) | FATTO | `QuickActionSheet` con Drawer vaul |
| "Registra alimento" (ricerca + pesata) | FATTO | Apre `WeighingModal` |
| "Scansiona codice a barre" | FATTO | Naviga a `/scan` |
| "Acqua" | FATTO | Naviga a `/hydration` |
| "Peso" | FATTO | Apre input peso corporeo |

### SCANSIONE BARCODE

| Funzionalita' | Stato | Note |
|---|---|---|
| Scansione barcode con fotocamera | FATTO | Usa `html5-qrcode` in `/scan` |
| Lookup barcode (database interno + Open Food Facts) | FATTO | Edge function `lookup-barcode` |
| OCR etichetta nutrizionale | FATTO | Edge function `ocr-nutrition-label` |
| Segnalazione correzione valori nutrizionali | FATTO | Edge function `submit-nutrition-correction`, tabella `product_submissions` |

### IDRATAZIONE

| Funzionalita' | Stato | Note |
|---|---|---|
| Pagina dedicata `/hydration` | FATTO | Con silhouette, progressi, statistiche |
| Preset rapidi (250ml, 500ml, 700ml, 1L, 1.5L) | FATTO | Come da documento |
| Rimuovi ultimo bicchiere | FATTO | |
| Obiettivo giornaliero configurabile | FATTO | Nel profilo |
| Storico 7 giorni (mini bar chart) | FATTO | |

### PESO CORPOREO

| Funzionalita' | Stato | Note |
|---|---|---|
| Inserimento peso | FATTO | Tramite QuickActionSheet e profilo |
| Storico peso (sparkline nella home) | FATTO | `WeightSlide` |
| Grafico peso con target | FATTO | `WeightChart` nella pagina Charts |

### GRAFICI E ANALISI

| Funzionalita' | Stato | Note |
|---|---|---|
| Selettore intervallo (7G, 1M, 3M, 6M) | FATTO | Tabs nella pagina Charts |
| Grafico calorie giornaliere con target | FATTO | `CaloriesChart` |
| Grafico proteine | FATTO | `MacroChart` |
| Grafico carboidrati | FATTO | `MacroChart` |
| Grafico grassi | FATTO | `MacroChart` |
| Grafico acqua | FATTO | `WaterChart` |
| Grafico peso | FATTO | `WeightChart` |

### IL MIO DATABASE

| Funzionalita' | Stato | Note |
|---|---|---|
| Sezione "I miei prodotti" (CRUD) | FATTO | In `/my-products` con tabella `user_products` |
| Sezione "Il mio ricettario" | FATTO | Componenti `RecipeList`, `RecipeForm`, `RecipeDetail` |
| Categorie ricettario (Antipasti, Primi, Secondi, Contorni, Dolci) | FATTO | Tabella `recipes` con campo `category` |
| Aggiunta nuova categoria | DA VERIFICARE | Il campo e' text libero, ma l'UI potrebbe non supportare categorie custom |

### PROFILO

| Funzionalita' | Stato | Note |
|---|---|---|
| Modifica dati personali | FATTO | Form completo |
| Avatar/foto profilo | FATTO | Upload su storage `avatars` |
| Ricalcolo automatico target (TDEE) | FATTO | `calculateTDEE` + `calculateMacros` |
| Tema chiaro/scuro | FATTO | Switch con `next-themes` |
| Export dati (GDPR) | FATTO | Edge function `export-user-data` |
| Cancellazione account (GDPR) | FATTO | Edge function `delete-account` con dialog conferma |

### COLLEGAMENTO BILANCIA

| Funzionalita' | Stato | Note |
|---|---|---|
| Pairing via QR / codice | FATTO | Edge function `pair-device` |
| Visualizzazione numero di serie | FATTO | Nel banner home e profilo |
| Disconnessione dispositivo | FATTO | Bottone unpair nel profilo |

### EDGE FUNCTIONS (BILANCIA - SERVER)

| Funzionalita' | Stato | Note |
|---|---|---|
| Ricerca barcode da bilancia | FATTO | `device-lookup-barcode` |
| Invio pesata con calcolo nutrienti | FATTO | `device-send-weighing` |
| Creazione macroricetta da bilancia | FATTO | `device-get-recipe` |
| Pairing device | FATTO | `pair-device` |

---

### LATO ADMIN

| Funzionalita' | Stato | Note |
|---|---|---|
| Login admin (stessa auth, ruolo verificato) | FATTO | `useAdminCheck` + `user_roles` |
| Gestione Utenti (tabella con lista) | FATTO | `/admin/users` |
| Modifica utente | FATTO | `AdminUsers` con modale |
| Elimina utente | FATTO | Con dialog di conferma |
| Log pasti dell'utente | DA VERIFICARE | Potrebbe non essere implementato nel pannello admin |
| Gestione Notifiche | FATTO | `/admin/notifications` |
| Notifica a tutti (titolo, descrizione, URL) | FATTO | Edge function `admin-send-notification` |
| Log precedenti notifiche | FATTO | Tabella `notifications` |
| Gestione KO Alimenti (product_submissions) | FATTO | `/admin/products` |
| Convalida alimento | FATTO | Edge function `admin-manage-products` |
| Creazione alimento da admin | FATTO | |
| Registra alimento con barcode | FATTO | |

---

## Elementi MANCANTI o da Completare

### 1. SSO Facebook e Apple (Priorita' bassa)
Il documento menziona accesso con Google, Facebook e Apple. Attualmente solo Google e' implementato. Facebook e Apple richiedono configurazioni OAuth specifiche su ogni piattaforma.

### 2. Log pasti dell'utente nel pannello Admin (Priorita' media)
Il documento prevede che l'admin possa vedere i pasti registrati da ogni utente cliccando un bottone nella lista utenti. Questo potrebbe non essere implementato nel pannello admin attuale.

### 3. Navigazione Bottom Bar: "Impostazioni" vs "Grafici" (Bug UI)
Nella `BottomNav`, la terza voce (dopo il FAB) e' etichettata "Impostazioni" ma punta a `/charts` (Grafici). Secondo il documento il layout della navbar dovrebbe essere: Home, Database, +, Impostazioni, Profilo. La pagina Grafici non ha un punto d'ingresso dedicato nella navbar -- nel mockup i grafici sono accessibili dalle "Impostazioni" o da un'altra area.

### 4. Pagina "Impostazioni" separata dal Profilo (Priorita' media)
Il documento distingue tra "Impostazioni" e "Profilo" come due voci separate nella navbar. Attualmente "Impostazioni" punta ai grafici e "Profilo" contiene tutto (dati personali + impostazioni + device). Potrebbe servire una pagina Impostazioni dedicata che contenga grafici, tema, export, ecc.

### 5. Notifiche Push reali (Priorita' bassa)
L'infrastruttura per i push token e' presente (`push_tokens` table, `manage-push-token` edge function), ma le notifiche push reali (service worker, FCM) potrebbero non essere completamente funzionanti. Il PWA manifest e' configurato (`vite-plugin-pwa`).

### 6. Multi-profilo bilancia (Fuori scope app)
Il documento menziona la gestione multi-profilo a livello di bilancia (piu' utenti sulla stessa bilancia). Questo e' una feature firmware-side, non app-side. L'app e' single-user per design.

---

## Riepilogo Percentuale di Completamento

| Area | Completamento |
|---|---|
| Auth & Registrazione | 90% (mancano SSO Facebook/Apple) |
| Onboarding | 100% |
| Home Page | 100% |
| Diario Alimentare | 100% |
| Scansione & Barcode | 100% |
| Idratazione | 100% |
| Peso Corporeo | 100% |
| Grafici & Analisi | 100% |
| Database (Prodotti + Ricette) | 100% |
| Profilo & Impostazioni | 95% (navigazione da rivedere) |
| Collegamento Bilancia | 100% |
| Edge Functions (Bilancia) | 100% |
| Admin Dashboard | 95% (log pasti utente da verificare) |
| GDPR (Export + Delete) | 100% |
| Notifiche Push | 70% (infrastruttura presente, invio reale da completare) |
| PWA | 90% (manifest e icone presenti) |

**Completamento complessivo stimato: ~95%**

Le uniche aree non completamente allineate al documento sono:
1. SSO Facebook/Apple (configurazione OAuth esterna)
2. Label "Impostazioni" nella navbar che punta a Grafici
3. Log pasti utente nel pannello Admin
4. Invio notifiche push reali (FCM/VAPID)

