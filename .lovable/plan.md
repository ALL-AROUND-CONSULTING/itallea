

## Piano di implementazione: aggiornamenti dalla risposta della software house

### Cosa sappiamo ora

Dalla loro risposta e dal documento aggiornato:

1. **client_id**: `019cf6e9-eb89-7231-8c1e-fd4c46d7ff07`
2. **client_secret**: `L2EtxKyDGiOmrVVqWytsblhNbdVlUm4muJWoDxKQ`
3. **Reset password**: `POST /api/password/email` con body `{ "email": "..." }`
4. **Ricerca prodotti**: Usare `POST /api/app/products/get` con body `{ "search": "..." }` (non esiste un endpoint `/search/` separato)
5. **Eliminazione/modifica pasto**: Non ancora previsti
6. **Eliminazione account**: Previsto ma non ancora implementato
7. **CORS**: Dicono di non avere problemi (testano con Postman — ma Postman non ha CORS). Da verificare, per ora teniamo il proxy.

### Problemi da fixare nel codice

**1. Sostituire i PLACEHOLDER OAuth** (2 file)
- `src/lib/authService.ts` riga 22-23: sostituire `PLACEHOLDER_CLIENT_ID` e `PLACEHOLDER_CLIENT_SECRET` con i valori reali
- `src/lib/apiClient.ts` riga 77-78: stessa sostituzione nel refresh token

**2. Fix ricerca prodotti** (`src/hooks/useProductSearch.ts`)
- Endpoint sbagliato: usa `/api/app/products/search/` che non esiste
- Deve usare `/api/app/products/get` con body `{ "search": query }`

**3. Fix registrazione** (`src/pages/Register.tsx`)
- Invia il campo `name` nel body, ma la documentazione dice che il nome viene auto-impostato dalla parte locale dell'email. Il body richiede solo `email`, `password`, `password_confirmation`
- Possiamo comunque tenere il campo name nel form per UX, ma non inviarlo nel body API

**4. Migrare ForgotPassword** (`src/pages/ForgotPassword.tsx`)
- Attualmente usa `supabase.auth.resetPasswordForEmail`
- Deve chiamare `POST /api/password/email` con body `{ "email": "..." }` via `apiClient`
- Nota: la software house non ha specificato un endpoint per il reset vero e proprio (impostare nuova password), solo per l'invio email. ResetPassword.tsx resta su Supabase per ora.

**5. Nota sulla nota del documento**: La software house dice che il sistema email non è ancora attivo — il codice temporaneo per la verifica è `000000`.

### Dettaglio tecnico delle modifiche

| File | Modifica |
|------|----------|
| `src/lib/authService.ts` | client_id → `019cf6e9-...`, client_secret → `L2EtxKyDGi...` |
| `src/lib/apiClient.ts` | Stessa sostituzione nel refresh flow |
| `src/hooks/useProductSearch.ts` | Path da `/api/app/products/search/` a `/api/app/products/get`, body da `{ query }` a `{ search: query }` |
| `src/pages/Register.tsx` | Rimuovere `name` dal body API (tenere nel form per UX futura) |
| `src/pages/ForgotPassword.tsx` | Sostituire `supabase.auth` con `apiClient("/api/password/email", ...)` |

5 file, modifiche chirurgiche. Nessuna riscrittura necessaria.

