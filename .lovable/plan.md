

# Ricostruzione Home Page + Navbar dal Design Figma

## Correzioni rispetto al piano precedente

### 1. Header: Scanner, non Bluetooth
L'icona in alto a destra nel design e uno **scanner** (barcode/QR), non un'icona Bluetooth. Verra sostituita con l'icona `ScanLine` da lucide-react e collegata alla pagina `/scan`.

### 2. Bottom Nav: replica fedele dal mockup
Dal mockup il navbar in basso mostra esattamente:
- **Home** (icona casa, attiva = blu)
- **Database** (icona database/griglia)
- **+** (FAB centrale blu, rialzato)
- **Impostazioni** (icona ingranaggio)
- **Profilo** (icona utente)

Le etichette sono visibili sotto ogni icona. L'elemento attivo e evidenziato in blu brand. Il FAB centrale e un cerchio blu rialzato con icona `+` bianca. Non ci sono indicatori animati aggiuntivi (niente linea sotto l'icona attiva) -- stile pulito e minimale.

### 3. Rimozione ActionBar
L'ActionBar secondaria (scan/pesata/diario sopra la navbar) non esiste nel mockup. Verra rimossa dalla home e la sua funzionalita (scan, pesata) resta nel FAB e nel pulsante scanner dell'header.

## Piano di Implementazione Completo

### File da modificare/creare

| File | Azione |
|------|--------|
| `src/components/dashboard/HomeHeader.tsx` | Aggiornato - icona scanner al posto di Bluetooth, naviga a /scan |
| `src/components/layout/BottomNav.tsx` | Riscritto - stile fedele al mockup, niente indicatore animato |
| `src/components/layout/AppLayout.tsx` | Aggiornato - rimuovere ActionBar dalla home |
| `src/components/dashboard/HomeCarousel.tsx` | Nuovo - wrapper Embla per 3 slide con dots |
| `src/components/dashboard/GoalsSlide.tsx` | Riscritto - gauge semicircolare SVG |
| `src/components/dashboard/CaloriesDonutCard.tsx` | Aggiornato - stile slide card |
| `src/components/dashboard/WeightSlide.tsx` | Riscritto - sparkline + layout peso |
| `src/components/dashboard/QuickCards.tsx` | Aggiornato - Idratazione + Database fedeli |
| `src/components/dashboard/DeviceBanner.tsx` | Aggiornato - card "Aggiungi dispositivo" |
| `src/pages/Index.tsx` | Aggiornato - integrazione carosello |

### Dettagli tecnici

**HomeHeader.tsx**
- Sostituire `Bluetooth` con `ScanLine` da lucide-react
- onClick naviga a `/scan`
- Resto del layout invariato (logo, avatar, saluto)

**BottomNav.tsx**
- 5 elementi: Home, Database, FAB (+), Impostazioni, Profilo
- Icone: `Home`, `Database`, `Plus`, `Settings`, `User` da lucide-react
- FAB: cerchio blu brand rialzato (-mt-6), ombra, icona + bianca
- Elemento attivo: colore blu brand (testo + icona), inattivi: grigio
- Nessun indicatore a linea sotto l'icona (rimuovere `layoutId="nav-indicator"`)
- Sfondo bianco solido con bordo superiore sottile

**AppLayout.tsx**
- Rimuovere il rendering condizionale di `ActionBar`
- Mantenere solo `BottomNav`
- Il padding bottom del main resta per compensare la navbar

**HomeCarousel.tsx**
- Usa `embla-carousel-react` (gia installato)
- 3 slide: GoalsSlide, CaloriesDonutCard, WeightSlide
- Dots indicatori sotto: 3 pallini, quello attivo e blu brand, gli altri grigi
- Ogni slide e una card con bordi arrotondati, sfondo bianco, ombra leggera
- Badge "Oggi" blu in alto a destra di ogni card

**GoalsSlide.tsx**
- Gauge semicircolare SVG custom
- Arco con 3 zone colorate: grigio (sotto soglia), verde (obiettivo), rosso (sopra)
- Lancetta nera che ruota in base a percentuale kcal consumate vs obiettivo
- A destra del gauge: icona bandiera + "Obiettivo base [X]", icona fuoco + "Alimenti [X]"
- Legenda in basso: 3 pallini con etichette (Sotto soglia, Nel tuo obiettivo, Sopra soglia)

**CaloriesDonutCard.tsx (slide Calorie)**
- Donut chart a sinistra (recharts PieChart)
- A destra: 3 righe macro con pallino colorato + nome + valore
  - Carboidrati (grigio), Proteine (blu), Grassi (arancione)
- Sottotitolo "Rimanente = Obiettivo - Alimenti + Esercizi"

**WeightSlide.tsx**
- Riga superiore: Iniziale / Attuale / Variazione % (verde se negativo, rosso se positivo)
- Peso grande centrato (es. "80.00 kg")
- Mini sparkline SVG (polyline) con ultimi punti peso
- Pulsante "+ Inserisci peso" blu pill-shaped in basso

**QuickCards.tsx**
- Due card affiancate con bordi arrotondati
- **Idratazione**: icona goccia blu, valore attuale in ml, testo "Obiettivo: [X] ml", barra progresso orizzontale blu
- **Il mio database**: icona piatto/forchetta, testo "Aggiungi ricetta o alimento", navigazione a /my-products

**DeviceBanner.tsx**
- Se nessun dispositivo: card con "Aggiungi dispositivo" + "Inizia il tuo viaggio con Ital Lea" + pulsante + blu
- Se dispositivo connesso: card compatta con nome dispositivo e LED verde

