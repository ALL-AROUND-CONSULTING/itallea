

## Analisi della Richiesta della Software House

La software house chiede essenzialmente di **sganciare completamente l'app da Supabase** per autenticazione e chiamate API, sostituendoli con i loro endpoint REST. Analizziamo punto per punto.

---

### Cosa chiedono

1. **Login custom** via `POST /oauth/token/` che ritorna `access_token` + `refresh_token`
2. **API calls** verso i loro endpoint (es. `/api/lookup-barcode/`) con `Authorization: Bearer <token>`
3. **Meccanismo di refresh token** automatico quando l'access token scade

---

### Stato attuale dell'app e dipendenza da Supabase

L'app ha un legame **profondo** con Supabase in due aree:

**1. Autenticazione (9 file coinvolti)**
- Login, Register, ForgotPassword, ResetPassword, VerifyEmail usano tutti `supabase.auth.*`
- Il contesto `AuthContext` gestisce sessioni con `onAuthStateChange` e `getSession`
- Google OAuth usa `@lovable.dev/cloud-auth-js` che chiama `supabase.auth.setSession`

**2. Operazioni CRUD dirette sul database (7 file coinvolti)**
- `supabase.from("weighings")`, `supabase.from("water_logs")`, `supabase.from("weight_logs")`, `supabase.from("profiles")`, `supabase.from("recipes")`, `supabase.from("user_products")`, ecc.
- Edge functions chiamate via `fetch` verso `SUPABASE_URL/functions/v1/...`

---

### Si può fare? Si, ma è un lavoro significativo

La risposta è **sì, è fattibile**, ma richiede un refactor sostanziale. Ecco cosa serve:

#### Fase 1 — Nuovo layer di autenticazione
Creare un **AuthService** custom che:
- Chiama `POST /oauth/token/` per il login
- Salva `access_token` e `refresh_token` in `localStorage`
- Gestisce il refresh automatico quando il token scade (intercettore HTTP)
- Riscrive `AuthContext` per usare questo servizio invece di `supabase.auth`

#### Fase 2 — Client HTTP centralizzato
Creare un **apiClient** (wrapper su `fetch`) che:
- Aggiunge automaticamente `Authorization: Bearer <token>` a ogni richiesta
- Intercetta risposte 401 → tenta refresh → ripete la chiamata
- Punta al base URL della software house (`https://italea.test.b4web.biz`)

#### Fase 3 — Sostituire tutte le chiamate Supabase
- Ogni `supabase.from("tabella").insert/select/update/delete` deve diventare una chiamata REST al loro backend
- Ogni `fetch` verso edge functions deve puntare ai nuovi endpoint
- Servono **circa 15-20 endpoint** sul loro backend per coprire tutte le operazioni attuali

#### Fase 4 — Rimuovere flussi non necessari
- VerifyEmail, ForgotPassword, ResetPassword → dipendono da come la software house gestisce questi flussi
- Google OAuth → va reimplementato con il loro sistema

---

### Cosa consiglio di rispondere alla software house

La risposta breve è: **sì, possiamo farlo, ma serve un contratto API completo da parte loro.**

Quello che serve da loro prima di procedere:

1. **Lista completa degli endpoint** che implementeranno (non solo login e lookup-barcode)
2. **Formato di ogni request/response** per: weighings, water_logs, weight_logs, profiles, recipes, user_products, daily_nutrition, ecc.
3. **Flusso di registrazione**: come funziona? C'è verifica email? Come si fa reset password?
4. **Formato errori** standard (codici HTTP, struttura JSON degli errori)
5. **Refresh token endpoint**: quale URL, quale formato

Una volta che loro forniscono il contratto API completo, posso refactorizzare l'app per sganciare completamente Supabase e puntare ai loro servizi.

---

### Per la demo che chiedono (login + lookup-barcode)

Posso creare una **versione demo** che:
- Fa login verso `POST https://italea.test.b4web.biz/oauth/token/`
- Salva il token in localStorage
- Chiama `POST https://italea.test.b4web.biz/api/lookup-barcode/` con il Bearer token
- Gestisce il refresh automatico

Questo è fattibile in tempi brevi come proof of concept. Vuoi che proceda con questa demo?

