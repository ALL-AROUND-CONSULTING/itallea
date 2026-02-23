

## Punto 1: Fix Lancetta Gauge + Punto 5: Prodotto non trovato -> Registrazione

---

### 1. Fix Lancetta del Gauge (GoalsSlide)

**Problema attuale**: La lancetta a 0% (nessuna caloria consumata) punta gia' nella zona verde. Questo perche' gli archi SVG e la formula della lancetta non sono allineati.

**Situazione attuale nel codice**:
- Arco grigio: da `-180deg` a `-110deg`
- Arco verde: da `-110deg` a `-20deg`  
- Arco rosso: da `-20deg` a `0deg`
- Lancetta: `needleAngle = -90 + pct * 90` (quindi 0% = -90deg, che cade dentro il verde)

**Fix**: Ricalcolare archi e lancetta in modo che:
- L'arco totale va da `-180deg` a `0deg` (semicerchio completo)
- Grigio: `-180deg` a `-50deg` (0% - 75% del target)
- Verde: `-50deg` a `-10deg` (75% - 110% del target)
- Rosso: `-10deg` a `0deg` (oltre 110%)
- Lancetta: `needleAngle = -180 + clampedPct * 180` cosi' 0% parte tutto a sinistra (grigio), 100% e' nel verde, e oltre 110% entra nel rosso

**File**: `src/components/dashboard/GoalsSlide.tsx`

---

### 2. Prodotto non trovato -> Form di registrazione

**Problema attuale**: Quando lo scanner non trova un prodotto, mostra solo "Prodotto non trovato" con un bottone per riscansionare. Il cliente vuole che l'utente possa registrare il prodotto mancante.

**Soluzione**: Nella schermata "not found" di `Scan.tsx`, aggiungere un bottone "Registra prodotto" che mostra un form inline con:
- Barcode (pre-compilato, non modificabile)
- Nome prodotto (obbligatorio)
- Brand (opzionale)
- Valori nutrizionali per 100g: kcal, proteine, carboidrati, grassi, fibre, sale
- Il salvataggio avviene nella tabella `user_products` (gia' esistente con RLS corretta)
- Dopo il salvataggio, il prodotto viene caricato come se fosse stato trovato dallo scanner, permettendo all'utente di procedere con la pesata

**File**: `src/pages/Scan.tsx`
- Aggiunta stato `showRegisterForm` e `scannedBarcode` per conservare il barcode
- Nuovo blocco UI nel caso `notFound` con il form di registrazione
- Funzione `handleRegisterProduct` che inserisce in `user_products` e poi imposta il prodotto trovato

---

### Dettaglio tecnico

**GoalsSlide.tsx** - Modifiche alla matematica:
- Archi SVG ridisegnati per coprire il semicerchio `-180` a `0` gradi
- Zone: grigio (0-75%), verde (75-110%), rosso (110%+)
- Formula lancetta: `-180 + min(pct, 1.3) * (180 / 1.3)` con clamp a 130%

**Scan.tsx** - Nuovo flusso "not found":
- Conservare il barcode scansionato in uno stato dedicato
- Mostrare due opzioni: "Scansiona altro" e "Registra prodotto"
- Il form di registrazione include tutti i campi nutrizionali con validazione base
- Inserimento in `user_products` con `user_id` dell'utente corrente
- Dopo il salvataggio, il prodotto viene mappato nel formato `ScannedProduct` e mostrato nella vista di dettaglio per procedere con grammi e pasto
