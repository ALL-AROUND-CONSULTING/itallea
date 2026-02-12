
# Redesign Impostazioni e Profilo - Allineamento Design Brand

## Problema Attuale

1. **La BottomNav** ha "Impostazioni" che punta a `/charts` (Grafici) -- non ha senso
2. **La pagina Profilo** usa il `PageHeader` generico (sfondo bianco con bordo) invece del gradiente azzurro brand usato nella Home e Hydration
3. **La pagina Grafici** e' etichettata come "Impostazioni" nella navbar ma mostra solo grafici
4. **Manca una vera pagina Impostazioni** separata dal Profilo

## Soluzione Proposta

### Ristrutturazione Navigazione

La BottomNav diventa:
- **Home** (`/`) 
- **Database** (`/my-products`)
- **+ FAB**
- **Grafici** (`/charts`) -- icona BarChart3, label "Grafici"
- **Profilo** (`/profile`)

Le **Impostazioni** (tema, bilancia, export, elimina account, admin) vengono spostate in una sotto-pagina accessibile dal Profilo tramite un'icona ingranaggio nell'header.

### Redesign Pagina Profilo

Applicare lo stesso stile dell'header azzurro gradiente usato nella Home:
- Header con gradiente `brand-light-blue` -> `brand-blue` -> `background`
- Avatar grande centrato nell'header con nome utente sotto
- Email sotto il nome
- Card arrotondate per le sezioni (Dati Personali, Misurazioni, Attivita', Target)
- Bottone "Salva" in stile brand-blue
- Link "Impostazioni" con icona ingranaggio in alto a destra nell'header

### Nuova Pagina Impostazioni (`/settings`)

Pagina dedicata con lo stesso header azzurro brand, contenente:
- Tema scuro (switch)
- Bilancia (pairing/unpairing)
- Pannello Admin (se admin)
- Export dati
- Elimina account
- Logout

### Redesign Pagina Grafici

Applicare lo stesso header azzurro gradiente invece del `PageHeader` generico.

---

## Dettagli Tecnici

### File da modificare

1. **`src/components/layout/BottomNav.tsx`**
   - Cambiare icona da `Settings` a `BarChart3`
   - Cambiare label da "Impostazioni" a "Grafici"
   - Route resta `/charts`

2. **`src/pages/Profile.tsx`**
   - Rimuovere le sezioni impostazioni (tema, bilancia, export, delete, logout)
   - Sostituire `PageHeader` con header gradiente azzurro (come `HomeHeader`)
   - Avatar grande centrato nel gradiente
   - Aggiungere icona ingranaggio che naviga a `/settings`
   - Stile card con bordi arrotondati e padding coerenti

3. **Nuovo file `src/pages/Settings.tsx`**
   - Header gradiente azzurro con titolo "Impostazioni" e freccia indietro
   - Lista di opzioni con icone: Tema, Bilancia, Admin, Export, Elimina, Logout
   - Stile coerente con il resto dell'app

4. **`src/pages/Charts.tsx`**
   - Sostituire `PageHeader` con header gradiente azzurro brand
   - Aggiungere freccia indietro o mantenerlo come tab principale

5. **`src/App.tsx`**
   - Aggiungere route `/settings` dentro le protected routes con layout

6. **`src/components/layout/PageHeader.tsx`** (opzionale)
   - Potrebbe essere esteso con una variante "brand" con gradiente, oppure si usa un componente inline nelle singole pagine

### Pattern di Design dell'Header Azzurro

Riutilizzare lo stesso gradiente gia' usato in `HomeHeader`:

```text
background: linear-gradient(180deg, 
  hsl(200 90% 92%) 0%,      /* brand-light-blue */
  hsl(210 80% 85%) 60%,     
  hsl(var(--background)) 100%  /* sfuma nel background */
)
border-radius: 0 0 2rem 2rem
```

### Struttura Visiva Profilo

```text
+----------------------------------+
|  [gradiente azzurro]             |
|        [Avatar grande]      [⚙️] |
|        Nome Cognome              |
|        email@example.com         |
+----------------------------------+
|                                  |
|  [Card] Dati Personali           |
|  [Card] Misurazioni              |
|  [Card] Attivita' & Idratazione  |
|  [Card] Target Giornalieri       |
|                                  |
|  [Salva e Ricalcola Target]      |
+----------------------------------+
```

### Struttura Visiva Impostazioni

```text
+----------------------------------+
|  [gradiente azzurro]             |
|  [←]  Impostazioni              |
+----------------------------------+
|                                  |
|  🌙 Tema scuro          [switch] |
|  ⚖️ La mia bilancia       [>]   |
|  🛡️ Pannello Admin        [>]   |
|  📥 Esporta dati          [>]   |
|  🗑️ Elimina account       [>]   |
|                                  |
|  [Esci]                          |
+----------------------------------+
```
