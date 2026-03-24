

## Piano: Test CORS diretto e rimozione proxy

### Cosa chiedono

La software house vuole che:
1. Testiamo se CORS funziona chiamando direttamente `api.itallea.b4web.biz` dal browser (senza proxy)
2. Se funziona, rimuoviamo il proxy
3. Gli forniamo un link web per provare l'app + un APK

### Cosa faremo

**Step 1 — Refactor `apiClient.ts` per chiamate dirette**

Sostituire `proxyFetch()` con chiamate `fetch()` dirette a `https://api.itallea.b4web.biz`. Il proxy resta nel codice ma non viene più usato.

Modifiche in `src/lib/apiClient.ts`:
- Nuova costante `BACKEND_URL = "https://api.itallea.b4web.biz"`
- Riscrivere `proxyFetch()` → `directFetch()` che fa `fetch(BACKEND_URL + path, ...)` direttamente
- Rimuovere dipendenza da `PROXY_URL` e `SUPABASE_ANON_KEY`
- Mantenere tutta la logica di auth/refresh/retry invariata

**Step 2 — Aggiornare `capacitor.config.json`**

L'`appId` va cambiato da `app.lovable.575945cfca0842dc852156af458a2079` a qualcosa tipo `com.itallea.app` (più professionale per gli store). Il `server.url` punta già al progetto Lovable pubblicato.

**Step 3 — Link e APK**

- **Link web**: L'app è già pubblicata su `https://itallea.lovable.app` — possiamo condividere questo
- **APK**: Serve un build Capacitor Android. Posso preparare le istruzioni ma il build va fatto localmente con Android Studio

### Dettaglio tecnico — `apiClient.ts` refactor

```typescript
// PRIMA (proxy):
async function proxyFetch(path, method, body, headers) {
  return fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ path, method, body, headers }),
  });
}

// DOPO (diretto):
const BACKEND_URL = "https://api.itallea.b4web.biz";

async function directFetch(path, method, body, headers) {
  const opts: RequestInit = {
    method,
    headers: { "Content-Type": "application/json", ...headers },
  };
  if (body && method !== "GET") opts.body = JSON.stringify(body);
  return fetch(BACKEND_URL + path, opts);
}
```

Tutti i punti che chiamano `proxyFetch` vengono aggiornati a `directFetch`. La logica di refresh token e retry 401 resta identica.

### File coinvolti

| File | Modifica |
|------|----------|
| `src/lib/apiClient.ts` | Sostituire proxy con chiamate dirette |
| `capacitor.config.json` | Aggiornare `appId` |

### Rischio

Se CORS non funziona, vedremo errori tipo `Access-Control-Allow-Origin` nella console. In quel caso ripristiniamo il proxy e comunichiamo alla software house gli errori esatti.

### Risposta per la software house

Dopo il test, prepareremo una risposta con:
- Conferma CORS funzionante (o errori specifici)
- Link web: `https://itallea.lovable.app`
- Per l'APK: istruzioni su come generarlo dal repository (serve Android Studio)

