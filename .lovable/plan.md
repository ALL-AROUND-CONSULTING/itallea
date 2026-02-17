

## Dev Bypass per Admin

Aggiungo un bypass solo in sviluppo (ambiente non-production) nel hook `useAdminCheck` che ti permette di accedere al pannello admin senza dover avere il ruolo nel database.

### Come funziona

- Nel hook `useAdminCheck.ts`, se l'app gira in modalita' sviluppo (`import.meta.env.DEV`), l'utente autenticato viene automaticamente considerato admin
- In produzione il controllo resta invariato (query alla tabella `user_roles`)
- Nessun rischio di sicurezza: il bypass esiste solo nel build di sviluppo, Vite lo rimuove completamente dal bundle di produzione

### Modifiche

**File: `src/hooks/useAdminCheck.ts`**
- Aggiunta condizione: se `import.meta.env.DEV` e' true e l'utente e' autenticato, `isAdmin` viene impostato a `true` immediatamente senza query al database
- In produzione il codice resta identico a quello attuale

