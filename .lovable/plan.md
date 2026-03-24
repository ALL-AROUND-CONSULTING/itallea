

## Piano: Ripristino proxy + comunicazione software house

### Situazione attuale

Ho testato direttamente dal browser la chiamata a `https://api.itallea.b4web.biz/oauth/token` (POST, senza trailing slash). Il risultato è:

```
Access to fetch at 'https://api.itallea.b4web.biz/oauth/token' from origin '...' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

**CORS non funziona.** Il server non invia gli header necessari. Il problema è lato software house, non nostro.

### Cosa faremo

**Step 1 — Ripristinare il proxy in `apiClient.ts`**

Rimettere la logica `proxyFetch` che passa attraverso l'Edge Function `backend-proxy`, così l'app torna funzionante immediatamente.

**Step 2 — Verificare che il login funzioni con il proxy**

Testare che il flusso login → proxy → backend funzioni correttamente.

### File coinvolti

| File | Modifica |
|------|----------|
| `src/lib/apiClient.ts` | Ripristinare `proxyFetch` via Edge Function |
| `src/lib/authService.ts` | Aggiornare i path se necessario |

### Mail per la software house

Dopo il ripristino, ti preparerò la mail con:
- L'errore CORS esatto dal browser
- Le istruzioni tecniche precise su cosa devono configurare
- Conferma che con Postman funziona ma il browser richiede CORS

