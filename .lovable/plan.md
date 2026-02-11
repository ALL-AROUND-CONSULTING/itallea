

# Redesign Homepage - Fedele al Mockup UI

## Analisi del Mockup

La UI di riferimento ha una struttura verticale (non carousel) con questi blocchi dall'alto in basso:

1. **Header con gradiente azzurro** - Logo "ITAL LEA" centrato con icona, sfondo gradiente celeste curvo
2. **Saluto utente** - Avatar circolare a sinistra, "Ciao + Nome" e icona Bluetooth/dispositivo a destra
3. **Sezione dispositivo** - Banner "Il mio dispositivo >" con info bilancia connessa (N. Serie)
4. **Card Calorie (stile donut chart)** - Titolo "Oggi" / "Calorie", sotto-titolo "Rimanente - Obiettivo - Alimenti - Esercizi", grafico donut con 3 colori (arancione, blu, grigio) e legenda a destra (Carboidrati 500, Proteine 800, Grassi 700), legenda pallini sotto (Sotto soglia / Nel tuo obiettivo / Sopra soglia), dots di paginazione
5. **Due card affiancate in basso** - "Idratazione" (icona goccia, 1.500 ml, obiettivo 2500 ml) e "Il mio database" (illustrazione, "Aggiungi ricetta o alimento")
6. **Bottom Nav a 5 icone** - Home, Database, + (centrale grande), Impostazioni, Profilo

## Differenze principali rispetto all'attuale

| Elemento | Attuale | Target |
|----------|---------|--------|
| Layout | Carousel orizzontale 4 slide | Scroll verticale, tutto visibile |
| Header | Barra semplice con testo | Gradiente azzurro curvo con logo |
| Saluto | Assente | Avatar + "Ciao Nome" |
| Dispositivo | Assente | Banner bilancia connessa |
| Calorie | 4 progress ring piccoli | Grande donut chart con legenda |
| Idratazione | Slide dedicata (SVG goccia grande) | Card compatta affiancata |
| Database | Assente nella home | Card compatta "Aggiungi ricetta" |
| Bottom Nav | 5 item testuali | 5 item con + centrale prominente |

## Piano di Implementazione

### 1. Aggiornare il tema colori

Aggiungere variabili CSS per il blu brand della UI (gradiente header azzurro, colori donut chart):
- `--brand-blue: 210 80% 55%`
- `--brand-light-blue: 200 90% 92%`

In `src/index.css`.

### 2. Creare il componente HomeHeader

Nuovo file `src/components/dashboard/HomeHeader.tsx`:
- Sfondo con gradiente da celeste chiaro a bianco, bordo inferiore curvo (border-radius o clip-path)
- Logo "ITAL LEA" centrato (testo stilizzato, niente immagine esterna)
- Riga sotto: avatar circolare con iniziali utente (da `useAuth().profile`), testo "Ciao {first_name}", icona dispositivo a destra

### 3. Creare il componente DeviceBanner

Nuovo file `src/components/dashboard/DeviceBanner.tsx`:
- Banner con sfondo scuro/blu "Il mio dispositivo >"
- Sotto: testo "Bilancia Ital Lea connessa." + "N. Serie ..." (placeholder statico per ora)
- Card con bordo arrotondato

### 4. Rifare la CaloriesCard con Donut Chart

Nuovo file `src/components/dashboard/CaloriesDonutCard.tsx`:
- Titolo "Oggi" centrato in blu
- Sottotitolo "Calorie" bold + riga "Rimanente - Obiettivo - Alimenti - Esercizi"
- Donut chart SVG con 3 segmenti colorati (carboidrati=grigio, proteine=blu, grassi=arancione)
- Legenda a destra del donut: pallino colorato + nome + valore
- Legenda sotto: 3 pallini con label (Sotto soglia verde, Nel tuo obiettivo arancione, Sopra soglia rosso)
- Dots indicatore paginazione (3 pallini, decorativi)
- Usa i dati da `useDailyNutrition()`

### 5. Creare le due card affiancate in basso

Nuovo file `src/components/dashboard/QuickCards.tsx`:
- Layout flex/grid 2 colonne
- **Card Idratazione**: icona goccia, valore attuale (es. 1.500 ml), "Obiettivo: 2500 ml" -- dati da `useWaterLog()`
- **Card "Il mio database"**: icona/illustrazione stilizzata, testo "Aggiungi ricetta o alimento", click naviga a `/my-products`

### 6. Aggiornare la BottomNav

Modificare `src/components/layout/BottomNav.tsx`:
- 5 voci: Home, Database, + (centrale), Impostazioni, Profilo
- Il pulsante centrale "+" diventa un cerchio grande rialzato (stile FAB) con sfondo blu
- Le label diventano: Home, Database, (nessuna label per +), Impostazioni, Profilo
- Rimuovere l'ActionBar separata (le sue funzioni migrano nel "+" della BottomNav che apre il WeighingModal o un menu)

### 7. Riscrivere Index.tsx

Rimuovere il carousel Embla. Struttura verticale:
```
<HomeHeader />
<DeviceBanner />
<CaloriesDonutCard data={nutrition} />
<QuickCards />
```

### 8. Aggiornare AppLayout.tsx

Rimuovere o rendere condizionale l'ActionBar sulla homepage (dato che il "+" migra nella BottomNav).

## File coinvolti

| File | Azione |
|------|--------|
| `src/index.css` | Aggiungere variabili colore brand blu |
| `src/components/dashboard/HomeHeader.tsx` | **Nuovo** - Header gradiente + saluto |
| `src/components/dashboard/DeviceBanner.tsx` | **Nuovo** - Banner dispositivo |
| `src/components/dashboard/CaloriesDonutCard.tsx` | **Nuovo** - Donut chart calorie |
| `src/components/dashboard/QuickCards.tsx` | **Nuovo** - 2 card affiancate |
| `src/pages/Index.tsx` | **Riscrivere** - Layout verticale |
| `src/components/layout/BottomNav.tsx` | **Modificare** - FAB centrale + nuove voci |
| `src/components/layout/AppLayout.tsx` | **Modificare** - ActionBar condizionale |

## Note tecniche

- Il donut chart sara' realizzato in SVG puro (stroke-dasharray/offset su cerchi) senza librerie aggiuntive, coerente con l'approccio gia' usato per ProgressRing
- I componenti GoalsSlide, MealCaloriesSlide, WaterSlide, WeightSlide rimangono disponibili per altre pagine (Diary, Charts) ma non piu' usati nella homepage
- I dati vengono dagli stessi hook esistenti (`useDailyNutrition`, `useWaterLog`, `useAuth`)
- Il DeviceBanner e' statico/placeholder per ora (nessuna integrazione Bluetooth reale)

