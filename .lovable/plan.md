

## Fix completo dei punti 1, 4, 5, 6 e 7

---

### Punto 1 -- Ricalibrazione lancetta gauge

**Problema**: Le zone colorate dell'arco e la formula della lancetta non sono allineate. L'arco totale va da -180deg a 0deg (180deg) e rappresenta 0-130% del target (maxPct=1.3). Ma le zone attuali usano angoli fissi (-46deg e -12deg) che non corrispondono ai confini 75% e 110%.

Calcolo corretto con maxPct=1.3:
- Grigia (0-75%): da -180deg a -180 + (0.75/1.3)*180 = **-76.2deg**
- Verde (75-110%): da -76.2deg a -180 + (1.1/1.3)*180 = **-27.7deg**
- Rossa (110-130%): da -27.7deg a 0deg

**File**: `src/components/dashboard/GoalsSlide.tsx`
- Sostituire gli angoli hardcoded delle tre zone con i valori calcolati: `arcPath(-180, -76)`, `arcPath(-76, -28)`, `arcPath(-28, 0)`
- La formula della lancetta resta invariata (gia' corretta)

---

### Punto 4 -- Pagina gestione bilancia

**Stato attuale**: PairDevice.tsx gestisce pairing/unpairing e profili. Settings.tsx ha una sezione minimale. Manca una vista di monitoraggio con storico pesate dalla bilancia.

**File nuovo**: `src/pages/DeviceManager.tsx`
- Sezione stato dispositivo (connesso/disconnesso, ultimo invio dati, hardware ID)
- Lista ultime pesate ricevute dal dispositivo (query su `weighings` dove `device_profile_id` non e' null)
- Link rapido a gestione profili (navigazione a PairDevice)
- Card riepilogativa con numero pesate oggi e ultima pesata

**File**: `src/App.tsx`
- Aggiunta rotta `/device` dentro le rotte protette con layout

**File**: `src/pages/Settings.tsx`
- Il pulsante "Bilancia collegata" naviga a `/device` invece di mostrare solo info inline

---

### Punto 5 -- Prodotti non trovati -> registrazione

**Stato attuale**: Gia' implementato! In Scan.tsx (righe 442-520) quando un barcode non viene trovato, c'e' gia' un bottone "Registra prodotto" che apre un form con barcode pre-compilato, campi nome/brand/valori nutrizionali per 100g, e salvataggio in `user_products`. Il prodotto registrato viene poi usato immediatamente per la pesata.

**Nessuna modifica necessaria** -- questo punto e' gia' completo.

---

### Punto 6 -- Gestione assenza di rete

**File nuovo**: `src/hooks/useNetworkStatus.ts`
- Hook che monitora `navigator.onLine` e gli eventi `online`/`offline`
- Espone `isOnline: boolean`

**File nuovo**: `src/components/layout/OfflineBanner.tsx`
- Banner sticky in alto che appare quando `isOnline === false`
- Testo: "Connessione assente -- Alcune funzionalita' potrebbero non essere disponibili"
- Colore warning (giallo/arancio), si nasconde automaticamente quando torna online con toast "Connessione ripristinata"

**File**: `src/components/layout/AppLayout.tsx`
- Aggiunta di `OfflineBanner` prima del contenuto principale

**File**: `src/integrations/supabase/client.ts` -- NON modificabile, quindi il retry va gestito a livello di QueryClient.

**File**: `src/App.tsx`
- Configurazione `QueryClient` con `retry: 2` e `retryDelay` esponenziale come default per tutte le query
- Aggiunta `onError` globale che mostra toast in caso di errore di rete

---

### Punto 7 -- Overview endpoints admin

**File nuovo**: `src/pages/admin/AdminEndpoints.tsx`
- Tabella con tutte le 14 edge functions elencate
- Per ciascuna: nome, metodo, stato JWT (da config.toml), e un pulsante "Test" che fa un health-check (OPTIONS request)
- Colonna stato: pallino verde/rosso in base alla risposta
- Possibilita' di testare tutti in batch con un bottone "Testa tutti"

**File**: `src/components/admin/AdminLayout.tsx`
- Aggiunta voce di navigazione "Endpoints" con icona `Server`

**File**: `src/App.tsx`
- Aggiunta rotta `/admin/endpoints` dentro le rotte admin

---

### Riepilogo modifiche

| Punto | File | Tipo |
|-------|------|------|
| 1 | GoalsSlide.tsx | Modifica (3 angoli) |
| 4 | DeviceManager.tsx | Nuovo file |
| 4 | App.tsx, Settings.tsx | Modifica |
| 5 | -- | Gia' fatto |
| 6 | useNetworkStatus.ts | Nuovo hook |
| 6 | OfflineBanner.tsx | Nuovo componente |
| 6 | AppLayout.tsx, App.tsx | Modifica |
| 7 | AdminEndpoints.tsx | Nuovo file |
| 7 | AdminLayout.tsx, App.tsx | Modifica |

