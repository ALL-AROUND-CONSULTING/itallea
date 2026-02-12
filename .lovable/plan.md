

# Piano di Completamento ITAL LEA -- Roadmap Dettagliata

## Stato Attuale: ~35% completato

Il progetto ha le fondamenta solide (auth, onboarding, homepage, diario, scanner, grafici base, prodotti personali) ma manca di circa il 65% delle funzionalita richieste dal blueprint.

---

## FASE 1 -- Core Utente Mancante
**Obiettivo**: completare tutte le funzionalita utente fondamentali
**Stima**: 8-10 step di implementazione

### 1.1 Ricettario Completo
Creare le tabelle `recipes` e `recipe_ingredients` nel database con RLS. Implementare CRUD completo per creare ricette composte da piu ingredienti con calcolo automatico dei macronutrienti. Collegare alla UI delle categorie gia esistente in MyProducts (attualmente solo placeholder con toast "Prossimamente").

**Tabelle da creare:**
- `recipes` (id, user_id, name, category, servings, notes, created_at, updated_at)
- `recipe_ingredients` (id, recipe_id, product_id/user_product_id, grams, kcal, protein, carbs, fat)

**UI da implementare:**
- Click su categoria (Antipasti, Primi, etc.) mostra lista ricette filtrate
- Form creazione ricetta con ricerca ingredienti (riutilizzando `useProductSearch`)
- Dettaglio ricetta con lista ingredienti, macro totali e per porzione
- Possibilita di usare una ricetta come "alimento" in una pesata

### 1.2 Tracking Idratazione Avanzato
Attualmente il sistema accetta solo 250ml fisso. Il blueprint richiede pulsanti rapidi multipli: bicchiere (250ml), bottiglia piccola (500ml), bottiglia media (700ml), bottiglia (1L), bottiglia grande (1.5L). Modificare il Diario e la Home per mostrare questi pulsanti.

### 1.3 Modifica Pesata Esistente
Nel Diario, aggiungere la possibilita di cliccare su una pesata e modificare grammi, pasto, o prodotto. Attualmente si puo solo eliminare.

### 1.4 Slide Mancanti Homepage
Aggiungere nel carousel della homepage:
- **Slide Obiettivi**: variazione calorie giornaliera rispetto al target (sopra/sotto soglia)
- **Slide Peso**: peso iniziale vs attuale vs target con indicatore visuale

---

## FASE 2 -- Autenticazione e Sicurezza
**Obiettivo**: completare i flussi auth mancanti e GDPR
**Stima**: 4-5 step

### 2.1 Recupero Password
Creare pagina `/forgot-password` con form email. Usa `supabase.auth.resetPasswordForEmail()`. Creare pagina `/reset-password` per impostare la nuova password dopo click sul link email.

### 2.2 Verifica Email OTP (opzionale)
Il sistema attuale invia gia email di conferma post-registrazione. Se si vuole aggiungere un flusso OTP in-app, si puo creare una pagina `/verify-email` che mostra un input OTP.

### 2.3 SSO Google
Abilitare il provider Google nella configurazione auth. Aggiungere un pulsante "Accedi con Google" nelle pagine Login e Register.

### 2.4 Esportazione Dati (GDPR)
Creare una Edge Function `export-user-data` che raccoglie tutti i dati dell'utente (profilo, pesate, acqua, peso, prodotti, ricette) e genera un file CSV/JSON scaricabile. Collegare al pulsante "Esporta dati" nel Profilo.

### 2.5 Eliminazione Account (GDPR)
Creare una Edge Function `delete-account` che elimina tutti i dati dell'utente e il suo account auth. Collegare al pulsante "Elimina account" nel Profilo con doppia conferma.

---

## FASE 3 -- Grafici Avanzati
**Obiettivo**: completare la sezione Charts come da blueprint
**Stima**: 2-3 step

### 3.1 Grafici Macro Separati
Aggiungere grafici a barre/linea per Proteine, Carboidrati e Grassi separatamente (ultimi 7 giorni). Riutilizzare lo stesso pattern del grafico calorie esistente.

### 3.2 Grafico Idratazione
Aggiungere grafico a barre per l'acqua bevuta negli ultimi 7 giorni, con linea di riferimento obiettivo.

### 3.3 Selettore Intervalli Temporali
Aggiungere tabs o segmented control per cambiare periodo: Settimana / Mese / 3 Mesi / 6 Mesi. Il hook `useWeeklyCalories` va generalizzato per accettare un range dinamico.

---

## FASE 4 -- Admin Dashboard
**Obiettivo**: creare il pannello di amministrazione completo
**Stima**: 5-6 step

### 4.1 Struttura Admin
Creare rotta `/admin` protetta da ruolo admin (la tabella `user_roles` e gia pronta). Layout con sidebar a 3 sezioni: Utenti, Notifiche, KO Alimenti. Protezione lato client (check ruolo) + lato server (Edge Functions con verifica ruolo).

### 4.2 Gestione Utenti
Tabella con lista utenti (nome, email, data registrazione). Click su utente mostra dettaglio con: dati profilo, log pasti degli ultimi 7 giorni, possibilita di modificare o eliminare l'utente.

**Edge Function**: `admin-manage-users` (GET lista, PATCH modifica, DELETE elimina) -- tutte con verifica ruolo admin.

### 4.3 Gestione Notifiche
Creare tabella `notifications` (id, title, message, url, sent_by, sent_at, sent_to_count). Form per comporre e inviare notifica a tutti. Log delle notifiche inviate precedentemente.

**Edge Function**: `admin-send-notification` (POST) -- salva nel log. La ricezione effettiva sara abilitata quando l'app diventa nativa con Capacitor.

### 4.4 Gestione KO Alimenti
Creare tabella `product_submissions` (id, user_id, barcode, name, brand, kcal, protein, carbs, fat, image_url, status, reviewed_by, created_at). L'admin puo: vedere le submission pendenti, approvarle (copia in `products`), rifiutarle, o creare direttamente un nuovo prodotto globale.

**Edge Function**: `admin-manage-products` (GET/POST/PATCH) -- CRUD prodotti globali con verifica admin.

### 4.5 Registrazione Alimento da Admin
Form dedicato per inserire un nuovo alimento nel database globale `products`, con possibilita di inserire barcode, valori nutrizionali, brand, immagine.

---

## FASE 5 -- Endpoints Bilancia (Device)
**Obiettivo**: creare l'infrastruttura per la comunicazione bilancia-server
**Stima**: 4-5 step

### 5.1 Tabella Devices e Pairing
Creare tabella `devices` (id, hardware_device_id, user_id, serial_number, paired_at, is_active). L'utente scansiona un QR code dalla bilancia che contiene l'`hardware_device_id`. L'app chiama l'endpoint di pairing che associa il device al profilo utente.

**Edge Function**: `pair-device` (POST) -- riceve `hardware_device_id` dall'app, lo associa all'utente autenticato. Aggiornare la UI del DeviceBanner nella homepage e la sezione "La mia bilancia" nel profilo.

### 5.2 Endpoint 2.1: Lookup Barcode per Device
**Edge Function**: `device-lookup-barcode` (GET) -- la bilancia chiama con `device_id` e `barcode`. Il server cerca il prodotto nel DB (`products` + `user_products` dell'utente associato al device) e risponde con nome + valori nutrizionali. Questo endpoint e chiamato dal firmware della bilancia, non dall'app.

### 5.3 Endpoint 2.2: Invio Pesata dal Device
**Edge Function**: `device-send-weighing` (POST) -- la bilancia invia `device_id`, `barcode`, `grams`. Il server calcola i macro e inserisce la pesata nella tabella `weighings` per l'utente associato al device. Nessuna interazione con l'app necessaria.

### 5.4 Endpoint 2.3: Macro Ricetta dal Device
**Edge Function**: `device-get-recipe` (GET) -- la bilancia richiede i macro di una ricetta dato il `recipe_id`. Il server risponde con il dettaglio nutrizionale totale della ricetta.

### 5.5 Submission Correzione Valori (Endpoint 3.6)
L'utente dall'app puo proporre una correzione dei valori nutrizionali di un prodotto. Crea un record in `product_submissions` con status "pending". L'admin lo revisiona dalla dashboard.

**Edge Function**: `submit-nutrition-correction` (POST) -- l'utente invia barcode + valori corretti.

---

## FASE 6 -- Funzionalita Avanzate
**Obiettivo**: OCR, notifiche, polish finale
**Stima**: 3-4 step

### 6.1 OCR Etichetta Nutrizionale
Creare una Edge Function `ocr-nutrition-label` che usa Lovable AI (Gemini) per analizzare una foto di un'etichetta nutrizionale e estrarre automaticamente i valori (kcal, proteine, carboidrati, grassi, fibre, sale). Integrare nella pagina di creazione prodotto come alternativa all'inserimento manuale.

### 6.2 Predisposizione Notifiche Push
Implementare l'infrastruttura server-side per le notifiche:
- Tabella `push_tokens` (id, user_id, token, platform, created_at)
- Edge Function per registrare/rimuovere token
- La tabella `notifications` (gia creata in Fase 4) memorizza i messaggi

Quando l'app sara convertita in nativa con Capacitor, bastera aggiungere il plugin `@capacitor/push-notifications` per collegare Firebase/APNs ai token salvati.

### 6.3 Onboarding Campi Mancanti
Aggiungere al flusso di onboarding:
- Campo telefono (opzionale)
- Upload immagine profilo (usa Storage)
- Questi campi vanno aggiunti anche alla pagina Profilo

### 6.4 UI Finale e Polish
Allineamento pixel-perfect di tutte le schermate con i mockup Figma. Animazioni, transizioni, micro-interazioni.

---

## Riepilogo Tabelle da Creare

| Tabella | Fase | Descrizione |
|---------|------|-------------|
| `recipes` | 1 | Ricette utente |
| `recipe_ingredients` | 1 | Ingredienti delle ricette |
| `devices` | 5 | Associazione bilancia-utente |
| `notifications` | 4 | Log notifiche inviate |
| `product_submissions` | 4 | Proposte correzione valori |
| `push_tokens` | 6 | Token per notifiche push |

## Riepilogo Edge Functions da Creare

| Funzione | Fase | Scopo |
|----------|------|-------|
| `export-user-data` | 2 | Esportazione GDPR |
| `delete-account` | 2 | Eliminazione account GDPR |
| `admin-manage-users` | 4 | CRUD utenti (admin) |
| `admin-send-notification` | 4 | Invio notifiche (admin) |
| `admin-manage-products` | 4 | CRUD prodotti globali (admin) |
| `pair-device` | 5 | Pairing bilancia QR |
| `device-lookup-barcode` | 5 | Lookup prodotto per bilancia |
| `device-send-weighing` | 5 | Ricezione pesata da bilancia |
| `device-get-recipe` | 5 | Macro ricetta per bilancia |
| `submit-nutrition-correction` | 5 | Proposta correzione valori |
| `ocr-nutrition-label` | 6 | OCR etichetta con AI |

## Riepilogo Pagine/Rotte da Creare

| Rotta | Fase | Descrizione |
|-------|------|-------------|
| `/forgot-password` | 2 | Recupero password |
| `/reset-password` | 2 | Nuova password dopo reset |
| `/admin` | 4 | Dashboard admin |
| `/admin/users` | 4 | Gestione utenti |
| `/admin/notifications` | 4 | Gestione notifiche |
| `/admin/products` | 4 | Gestione KO alimenti |

---

## Ordine di Esecuzione Consigliato

La sequenza ottimale e procedere fase per fase, completando ogni blocco prima di passare al successivo. All'interno di ogni fase, gli step sono gia ordinati per dipendenza logica.

**Fase 1** va fatta per prima perche completa le funzionalita core che l'utente finale usa quotidianamente. **Fase 2** segue subito dopo per sicurezza e compliance. **Fase 3** e indipendente e puo essere fatta in parallelo con la Fase 2. **Fase 4** (Admin) e la piu corposa e autonoma. **Fase 5** (Bilancia) dipende dalla Fase 1 (ricettario) e dalla Fase 4 (prodotti globali). **Fase 6** e di rifinitura finale.

Tutto e implementabile al 100% su Lovable, con l'unica eccezione della comunicazione Bluetooth/WiFi diretta con la bilancia, che dipende dal firmware del dispositivo hardware.

