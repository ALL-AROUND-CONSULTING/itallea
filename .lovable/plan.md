

# Riprogettazione Onboarding secondo Mockup Figma

## Differenze tra stato attuale e mockup

| Elemento | Attuale | Mockup |
|---|---|---|
| Numero step | 4 step con progress bar | 2 step ("Step 1/2", "Step 2/2") |
| Schermata benvenuto | Assente | Presente dopo verifica email con logo, confetti e "Iniziamo!" |
| Layout | Card con CardHeader/CardContent | Sfondo bianco pulito, input minimal |
| Header | Progress bar + emoji titolo | Freccia indietro "<" + "Le tue informazioni" + "Step X/2" |
| Step 1 campi | Nome, Cognome, Data nascita, Sesso | Nome, Cognome, Email (readonly), Telefono (+39), Data nascita, Peso |
| Step 2 campi | Peso, Altezza, Peso obiettivo | Avatar, Altezza, Obiettivo, Sesso, Attivita' fisica |
| Input style | Input standard con Label sopra | Input con placeholder inline, chevron ">" per select |
| Telefono | Step 4 opzionale, senza prefisso | Step 1, con prefisso "+39" fisso |
| Avatar | Step 4 opzionale | Step 2, cerchio con icona luna/camera |
| Pulsante | "Avanti" standard | Pill blu piena "Avanti" |

## Piano di Implementazione

### 1. Nuova schermata "Post-Verifica Benvenuto"

Creare una pagina intermedia che appare dopo la verifica email e prima dell'onboarding. Contiene:
- Testo "Benvenuto/a nella tua nuova app:" centrato in alto
- Logo Ital Lea grande al centro
- Testo "Completa la registrazione per poterti offrire i nostri migliori servizi"
- Pulsante blu "Iniziamo!" che naviga a `/onboarding`
- Decorazioni confetti leggere sullo sfondo

Questa schermata verra' mostrata dopo la verifica OTP: aggiornare `VerifyEmail.tsx` per navigare a `/post-verify` invece di `/`.

### 2. Ristrutturazione Onboarding in 2 Step

Riprogettare `Onboarding.tsx` da 4 step a 2:

**Step 1/2 - "Le tue informazioni":**
- Header: freccia indietro + titolo "Le tue informazioni" + sottotitolo "Step 1/2"
- Campi (stile input minimal con placeholder):
  - "Il tuo nome *"
  - "Il tuo cognome *"
  - "La tua email *" (precompilata, readonly dal contesto auth)
  - Telefono con prefisso "+39" fisso a sinistra + input numero
  - "La tua data di nascita" 
  - "Il tuo peso *"
- Pulsante "Avanti" blu pill in basso

**Step 2/2 - "Le tue informazioni":**
- Header: freccia indietro + titolo "Le tue informazioni" + sottotitolo "Step 2/2"
- Avatar: cerchio grande con icona + "Aggiungi un'immagine del profilo"
- Campi con chevron ">" a destra per i select:
  - "La tua altezza *"
  - "Il tuo obiettivo" (peso target, con chevron)
  - "Sesso" (con chevron)
  - "Fai Attivita' fisica?" (con chevron)
- Pulsante "Avanti" blu pill (completa l'onboarding)

### 3. Stile Input

Rimuovere il wrapper Card. Usare sfondo bianco pulito con:
- Input a larghezza piena con bordo sottile chiaro
- Placeholder inline (non label sopra)
- Campi select mostrati come riga con testo a sinistra e chevron ">" a destra
- Bordi arrotondati (rounded-xl)

### 4. Routing

- Aggiungere route `/post-verify` in `App.tsx`
- `VerifyEmail.tsx`: dopo verifica OTP riuscita, navigare a `/post-verify`
- `post-verify`: cliccando "Iniziamo!" naviga a `/onboarding`
- L'onboarding resta protetto (richiede auth)

---

## Sezione Tecnica

### File da creare:
- `src/pages/PostVerify.tsx` - Schermata benvenuto post-verifica

### File da modificare:
- `src/pages/Onboarding.tsx` - Ristrutturazione completa da 4 a 2 step con nuovo layout
- `src/pages/VerifyEmail.tsx` - Cambiare navigazione post-verifica da `/` a `/post-verify`
- `src/App.tsx` - Aggiungere route `/post-verify`

### Logica conservata:
- Tutto il calcolo TDEE/macros resta invariato
- Upload avatar resta invariato
- Salvataggio profilo su database resta invariato
- La validazione dei campi obbligatori resta attiva

