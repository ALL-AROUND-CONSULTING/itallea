

# Multi-profilo bilancia: gestione familiare

## Contesto
Attualmente la bilancia e' associata 1:1 a un singolo account utente. Il documento del cliente richiede che piu' membri della famiglia possano usare lo stesso dispositivo, ciascuno con il proprio profilo separato. In questo modo, quando qualcuno si pesa o registra un alimento sulla bilancia, i dati vengono attribuiti al profilo corretto.

## Architettura

La bilancia inviera' `device_id` + `profile_id` (o indice profilo) nelle richieste. L'utente proprietario del dispositivo gestira' i profili dall'app.

### 1. Nuova tabella `device_profiles`

```text
device_profiles
+------------------+--------+-------------------------------------------+
| Colonna          | Tipo   | Note                                      |
+------------------+--------+-------------------------------------------+
| id               | uuid   | PK                                        |
| device_id        | uuid   | FK -> devices.id ON DELETE CASCADE         |
| profile_index    | int    | Indice sul dispositivo (1, 2, 3...)       |
| name             | text   | Nome visualizzato ("Papa'", "Mamma", etc) |
| linked_user_id   | uuid   | Opzionale: collega a un account esistente  |
| created_at       | timestamptz | default now()                         |
+------------------+--------+-------------------------------------------+
```

- `profile_index` identifica il profilo sul firmware della bilancia (1-based)
- `linked_user_id` e' opzionale: se presente, le pesate vengono salvate nel diario di quell'utente; altrimenti vengono salvate sotto il proprietario del device con annotazione del profilo
- RLS: solo il proprietario del device puo' gestire i profili

### 2. Modifica tabella `weighings`

Aggiungere colonna opzionale:
- `device_profile_id` (uuid, nullable, FK -> device_profiles.id)

Cosi' ogni pesata registrata dalla bilancia porta l'indicazione di chi l'ha fatta.

### 3. Aggiornamento Edge Functions

**`device-send-weighing`**: accetta un parametro opzionale `profile_id` o `profile_index`. Se presente, cerca il profilo corrispondente e:
- Se il profilo ha un `linked_user_id`, registra la pesata sotto quell'utente
- Altrimenti, registra sotto il proprietario del device con `device_profile_id` valorizzato

**`device-lookup-barcode`** e **`device-get-recipe`**: accettano `profile_index` opzionale per cercare prodotti/ricette dell'utente collegato al profilo (se presente).

### 4. UI: Gestione profili dispositivo

**Pagina `PairDevice.tsx`** (sezione dispositivo gia' collegato):
- Aggiungere sezione "Profili bilancia" sotto le info del dispositivo
- Lista dei profili esistenti con nome e indice
- Pulsante "Aggiungi profilo" (max 4-5 profili)
- Per ogni profilo: modifica nome, elimina
- Opzione per collegare un profilo a un altro utente dell'app (tramite email)

**Pagina `Settings.tsx`** (sezione bilancia collegata):
- Mostrare numero di profili attivi
- Link rapido alla gestione profili

### 5. Nuovo hook `useDeviceProfiles`

Hook React per CRUD dei profili:
- Carica profili del dispositivo dell'utente corrente
- Aggiunge/modifica/elimina profili
- Invalida la cache quando cambia qualcosa

## Dettagli tecnici

### Migrazione SQL

```sql
CREATE TABLE public.device_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  profile_index integer NOT NULL DEFAULT 1,
  name text NOT NULL DEFAULT 'Profilo 1',
  linked_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (device_id, profile_index)
);

ALTER TABLE public.device_profiles ENABLE ROW LEVEL SECURITY;

-- RLS: solo il proprietario del device vede/gestisce i profili
CREATE POLICY "Device owner can view profiles"
  ON public.device_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

CREATE POLICY "Device owner can insert profiles"
  ON public.device_profiles FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

CREATE POLICY "Device owner can update profiles"
  ON public.device_profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

CREATE POLICY "Device owner can delete profiles"
  ON public.device_profiles FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM devices WHERE devices.id = device_profiles.device_id
    AND devices.user_id = auth.uid()
  ));

-- Aggiungere colonna a weighings
ALTER TABLE public.weighings
  ADD COLUMN device_profile_id uuid REFERENCES public.device_profiles(id);
```

### File da creare/modificare

| File | Azione |
|------|--------|
| Migrazione SQL | Creare tabella `device_profiles` + colonna su `weighings` |
| `src/hooks/useDeviceProfiles.ts` | Nuovo hook CRUD profili |
| `src/pages/PairDevice.tsx` | Aggiungere sezione gestione profili nella vista "dispositivo collegato" |
| `src/pages/Settings.tsx` | Mostrare conteggio profili nella card bilancia |
| `supabase/functions/device-send-weighing/index.ts` | Supporto `profile_index` |
| `supabase/functions/device-lookup-barcode/index.ts` | Supporto `profile_index` opzionale |
| `supabase/functions/device-get-recipe/index.ts` | Supporto `profile_index` opzionale |

### Flusso utente

1. L'utente collega la bilancia (come oggi)
2. Viene creato automaticamente il "Profilo 1" con il nome dell'utente
3. Dalla pagina dispositivo, puo' aggiungere fino a 4 profili extra (familiari)
4. Ogni profilo ha un indice (1-5) che viene impostato anche sulla bilancia
5. Quando la bilancia invia una pesata, include il `profile_index` per identificare chi sta pesando
6. L'app mostra nel diario solo le pesate dell'utente loggato (o del profilo collegato)

