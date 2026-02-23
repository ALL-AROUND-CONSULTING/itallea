

## Ricalcolo automatico dei target nutrizionali nel Profilo

### Analisi del documento e dello stato attuale

Ho analizzato il PDF "Relazione Ital Lea" e il codice esistente. La formula Mifflin-St Jeor e la ripartizione macro 30/40/30 sono corrette e conformi alle specifiche. Il calcolo TDEE nel codice e' allineato con quanto descritto nel documento.

**Stato attuale di Profile.tsx**: il ricalcolo avviene solo quando l'utente preme "Salva e Ricalcola Target". La card "Target Giornalieri" mostra i valori salvati nel database, non quelli calcolati in tempo reale.

**Problema**: l'utente non ha feedback immediato su come i cambiamenti di peso, altezza, sesso o attivita' influenzano i target. Deve salvare per vedere il risultato.

---

### Cosa cambia

1. **Anteprima live dei target**: la card "Target Giornalieri" mostrera' i valori ricalcolati in tempo reale ogni volta che l'utente modifica peso, altezza, data di nascita, sesso o livello di attivita'. Se i dati sono incompleti, la card mostra i valori attuali salvati nel profilo.

2. **Indicatore di variazione**: sotto i nuovi target viene mostrato un indicatore che segnala se i target sono cambiati rispetto a quelli salvati (es. "Nuovi target calcolati" in colore brand, oppure nessun indicatore se non sono cambiati).

3. **Validazione migliorata**: il pulsante "Salva" viene disabilitato se mancano i dati essenziali per il calcolo (peso, altezza). Un messaggio indica quali campi completare.

---

### Dettaglio tecnico

**File: `src/pages/Profile.tsx`**

- Aggiunta di un `useMemo` che ricalcola TDEE e macros dai valori correnti dei campi form (weight, height, dateOfBirth, sex, activityLevel)
- La card "Target Giornalieri" usa i valori calcolati dal memo invece dei valori `profile.*` dal database
- Se weight o height sono vuoti/invalidi, il memo ritorna i valori salvati nel profilo come fallback
- Aggiunta di un confronto tra i valori calcolati e quelli salvati: se sono diversi, viene mostrato un badge "Nuovi target" sotto la card
- Il pulsante "Salva" viene disabilitato se peso e altezza non sono compilati, con tooltip esplicativo

**File: `src/lib/nutrition.ts`** - Nessuna modifica, la logica e' corretta:
- Mifflin-St Jeor: maschio = 10*peso + 6.25*altezza - 5*eta + 5; femmina = stessa formula - 161
- Moltiplicatori attivita: sedentary 1.2, light 1.375, moderate 1.55, active 1.725, very_active 1.9
- Macro split: proteine 30% (÷4), carboidrati 40% (÷4), grassi 30% (÷9)

**File: `supabase/functions/get-daily-nutrition/index.ts`** - Nessuna modifica, legge correttamente i target dal profilo con fallback

