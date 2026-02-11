

# Step C1: Edge Function `lookup-barcode`

## Obiettivo
Creare una Edge Function che riceve un codice a barre, lo cerca prima nel database locale (`products`), e se non lo trova fa fallback sull'API pubblica **Open Food Facts** per recuperare i dati nutrizionali. Se trovato su OFF, il prodotto viene salvato nella tabella `products` per le ricerche future.

---

## Flusso logico

```text
Client invia GET /lookup-barcode?code=1234567890
         |
         v
  Cerca in tabella "products" per barcode
         |
    +----+----+
    |         |
 Trovato   Non trovato
    |         |
    v         v
 Ritorna   Chiama Open Food Facts API
 prodotto  GET https://world.openfoodfacts.org/api/v2/product/{code}
              |
         +----+----+
         |         |
      Trovato   Non trovato
         |         |
         v         v
   Salva in     Ritorna 404
   "products"   { found: false }
   e ritorna
```

---

## Dettagli tecnici

### 1. Registrazione in `supabase/config.toml`
Aggiungere la configurazione della nuova funzione con `verify_jwt = false` (la validazione JWT avviene nel codice).

### 2. File `supabase/functions/lookup-barcode/index.ts`

**Autenticazione**: Stessa struttura dell'edge function esistente -- legge l'header `Authorization`, crea il client Supabase con service role key, valida l'utente.

**Logica principale**:

1. Legge il query param `code` (barcode)
2. Cerca nella tabella `products` con `.eq("barcode", code).maybeSingle()`
3. Se trovato, ritorna `{ found: true, product: {...}, source: "local" }`
4. Se non trovato, chiama `https://world.openfoodfacts.org/api/v2/product/{code}?fields=product_name,brands,nutriments,image_url`
5. Se OFF ritorna `status: 1` (prodotto trovato):
   - Estrae i valori nutrizionali dal campo `nutriments` di OFF:
     - `energy-kcal_100g` -> `kcal_per_100g`
     - `proteins_100g` -> `protein_per_100g`
     - `carbohydrates_100g` -> `carbs_per_100g`
     - `fat_100g` -> `fat_per_100g`
     - `fiber_100g` -> `fiber_per_100g`
     - `salt_100g` -> `salt_per_100g`
   - Inserisce il prodotto nella tabella `products` con `source: 'openfoodfacts'` usando il service role client (bypassa RLS)
   - Ritorna `{ found: true, product: {...}, source: "openfoodfacts" }`
6. Se OFF ritorna status 0 o errore: ritorna `{ found: false }`

**Gestione errori**: Timeout di 5 secondi per la chiamata a OFF tramite `AbortController`. Se OFF non risponde, ritorna un errore 502 con messaggio chiaro.

### 3. Struttura della risposta

```text
Successo (200):
{
  found: true,
  product: {
    id, name, brand, barcode,
    kcal_per_100g, protein_per_100g, carbs_per_100g,
    fat_per_100g, fiber_per_100g, salt_per_100g,
    image_url, source
  },
  source: "local" | "openfoodfacts"
}

Non trovato (404):
{ found: false }
```

### 4. Nessun segreto aggiuntivo richiesto
Open Food Facts e' un'API pubblica, non richiede chiavi API.

---

## File coinvolti

| File | Azione |
|------|--------|
| `supabase/functions/lookup-barcode/index.ts` | Nuovo |
| `supabase/config.toml` | Aggiunta entry funzione |

