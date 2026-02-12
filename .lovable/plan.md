

# Ricostruzione Fedele delle Schermate Auth dal Design Figma

## Analisi del Design

Dallo screenshot emergono **5 schermate** con uno stile coerente:

1. **Splash/Welcome** -- Logo grande in basso a sinistra, sfondo bianco, pulsante "Login" blu in basso, link "Non hai un account? Registrati"
2. **Login** -- Logo centrato in alto, campi Email (icona busta) e Password (icona lucchetto + toggle occhio) con bordo arrotondato grigio, pulsante blu "Login", separatore "Oppure / Entra con:", icone social Apple + Google + Facebook
3. **Registrati** -- Come Login ma con campo "Conferma la Password" aggiuntivo, pulsante "Registrati", stesse icone social, "Hai gia un account? Accedi"
4. **Verifica Email (vuoto)** -- Logo in alto, freccia indietro, titolo "Verifica email", descrizione con email utente, 6 caselle OTP vuote e separate, "Non hai ricevuto il codice? Invia di nuovo", pulsante "Verifica" grigio/disabilitato
5. **Verifica Email (compilato)** -- Stesse caselle OTP riempite, pulsante "Verifica" blu/attivo

### Elementi di design chiave
- **Sfondo**: Bianco puro (`#FFFFFF`)
- **Colore primario**: Blu `~#4A90D9` (non il verde attuale!)
- **Logo**: "ITAL LEA" con icona telefono/bilancia tra le parole, tagline "L'equilibrio italiano a portata di app" con "no" in verde e rosso (tricolore)
- **Campi input**: Bordo grigio chiaro arrotondato, icona a sinistra (busta per email, lucchetto per password), toggle visibilita a destra per password
- **Pulsanti**: Full-width, bordo arrotondato (pill-shaped, `rounded-full`), sfondo blu
- **Social login**: Tre icone circolari (Apple, Google, Facebook) -- nota: Facebook non e supportato da Lovable Cloud, verra mostrato solo Google (e Apple se configurato)
- **OTP**: 6 caselle separate con bordo, non raggruppate

## Piano di Implementazione

### 1. Creare componente `AuthLogo`
Un componente riutilizzabile che riproduce il logo "ITAL LEA" come testo stilizzato (il logo vero verra sostituito quando caricherete l'immagine). Include la tagline con i colori del tricolore.

### 2. Creare pagina Splash/Welcome (`/welcome`)
- Sfondo bianco, logo posizionato in basso a sinistra
- Pulsante "Login" blu pill-shaped in basso
- Link "Non hai un account? Registrati" sotto il pulsante
- Rotta `/welcome` aggiunta come landing page pubblica

### 3. Riscrivere `Login.tsx`
- Rimuovere la Card shadcn e usare un layout diretto su sfondo bianco
- Logo `AuthLogo` centrato in alto
- Input personalizzati con icone inline (Mail, Lock, Eye/EyeOff da lucide-react)
- Pulsante "Login" blu pill-shaped full-width
- Separatore "Oppure" + "Entra con:" con icone social (Google funzionante, Apple come placeholder visivo)
- Link "Non hai un account? Registrati" in fondo

### 4. Riscrivere `Register.tsx`
- Stesso layout del Login
- Tre campi: Email, Password, Conferma Password (con validazione match)
- Checkbox GDPR mantenuto
- Pulsante "Registrati" blu
- Social login identico
- "Hai gia un account? Accedi"

### 5. Riscrivere `VerifyEmail.tsx`
- Logo centrato in alto
- Freccia indietro (ChevronLeft) in alto a sinistra
- Titolo "Verifica email" grande e centrato
- Descrizione con email dell'utente
- 6 InputOTPSlot **separati** (non raggruppati), con bordo visibile
- "Non hai ricevuto il codice? Invia di nuovo" con link blu
- Pulsante "Verifica" che diventa grigio quando vuoto, blu quando compilato

### 6. Aggiornare `ForgotPassword.tsx`
- Stesso stile delle altre schermate (logo, sfondo bianco, input con icone)

### 7. Creare componente `SocialLoginButtons`
Componente con le tre icone social (Apple, Google) disposte orizzontalmente. Solo Google funzionante tramite `lovable.auth.signInWithOAuth`. Apple come icona visiva (non cliccabile o con messaggio "presto disponibile").

### 8. CSS / Tema
- Aggiornare i colori `--brand-blue` nelle auth pages
- Input con stile custom: bordo grigio chiaro, icona a sinistra, padding sinistro per l'icona
- Pulsanti auth: `rounded-full` (pill shape), sfondo blu brand

## Dettagli Tecnici

### File modificati
| File | Azione |
|------|--------|
| `src/components/auth/AuthLogo.tsx` | Nuovo -- logo testuale riutilizzabile |
| `src/components/auth/SocialLoginButtons.tsx` | Nuovo -- icone Apple + Google |
| `src/components/auth/AuthInput.tsx` | Nuovo -- input con icona sinistra e toggle occhio |
| `src/pages/Welcome.tsx` | Nuovo -- splash screen |
| `src/pages/Login.tsx` | Riscritto -- layout da design |
| `src/pages/Register.tsx` | Riscritto -- aggiunto conferma password |
| `src/pages/VerifyEmail.tsx` | Riscritto -- OTP separati, stile fedele |
| `src/pages/ForgotPassword.tsx` | Riscritto -- stile coerente |
| `src/App.tsx` | Aggiunta rotta `/welcome` |

### Nota su Facebook
Il design mostra l'icona Facebook, ma Lovable Cloud supporta solo Google e Apple come provider OAuth. L'icona Facebook non verra inclusa per evitare confusione.

### Nota sul Logo
Il logo verra inizialmente reso come testo stilizzato. Potrai sostituirlo con l'immagine reale caricandola nel progetto e aggiornando il componente `AuthLogo`.

