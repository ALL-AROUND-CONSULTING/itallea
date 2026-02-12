
# Fix Peso, Idratazione e Spacing della Home

## Problemi identificati

### 1. WeightSlide (Peso) - Non fedele al mockup
Dal mockup, la slide Peso deve avere:
- "Oggi" blu centrato in alto (non a destra)
- "Peso" in grassetto a sinistra, sotto "Oggi"
- Riga stats: "Iniziale 100.00 kg", "Attuale 80.00 kg", "Variazione -20%" tutto sulla stessa riga senza sfondo/box grigio
- Peso grande "80.00 kg" allineato a **sinistra** (non centrato), con "kg" in grigio accanto
- Sparkline allineata a destra del peso (non sotto), formando una composizione peso+grafico sulla stessa riga
- Pulsante "+ Inserisci peso" blu con icona + circolare blu a sinistra del testo, centrato in basso

### 2. QuickCards Idratazione - Non fedele al mockup
Dal mockup, la card Idratazione deve avere:
- Titolo "Idratazione" in grassetto in alto a sinistra
- Sotto: un'icona **corpo umano stilizzato** (persona con riempimento acqua blu nella parte bassa) a sinistra
- A destra dell'icona: gocciolina blu + "1.500" in blu grande e grassetto
- Sotto: "Obiettivo: 2500 ml" in grigio
- Barra di progresso orizzontale blu in basso (piena, arrotondata)
- Niente icona Droplets in un box colorato -- layout completamente diverso

### 3. Spacing della Home
Tutto deve stare in viewport senza scroll:
- Ridurre padding/margin tra header, device banner, carousel, quick cards e navbar
- Compattare l'altezza delle slide del carosello
- Ridurre gap verticali generali

## Modifiche tecniche

### `src/components/dashboard/WeightSlide.tsx`
- Rimuovere il box grigio arrotondato attorno ai valori stats
- Mettere "Oggi" centrato in alto in blu
- Stats in riga semplice: "Iniziale X kg", "Attuale X kg", "Variazione X%" senza sfondo
- Peso grande allineato a sinistra con sparkline SVG a destra sulla stessa riga
- Pulsante "Inserisci peso" con icona + in cerchio blu + testo blu (non pulsante pieno bianco su blu)
- Ridurre padding/margin interni per compattezza

### `src/components/dashboard/QuickCards.tsx`
- Card Idratazione: rimuovere icona Droplets in box e il layout attuale
- Aggiungere SVG persona stilizzata (body outline) con riempimento acqua nella parte bassa del corpo
- Accanto: gocciolina SVG blu + valore ml in blu grande
- Sotto: "Obiettivo: X ml" in grigio
- Barra progresso blu in basso
- Card Database: mantenere sostanzialmente come e

### `src/pages/Index.tsx`
- Ridurre `py-4` a `py-2` e ottimizzare spacing
- Ridurre margin delle sezioni

### `src/components/dashboard/HomeHeader.tsx`
- Ridurre padding top/bottom per guadagnare spazio verticale

### `src/components/dashboard/DeviceBanner.tsx`
- Ridurre margin bottom

### `src/components/dashboard/HomeCarousel.tsx`
- Ridurre margin dots

### `src/components/dashboard/GoalsSlide.tsx` e `CaloriesDonutCard.tsx`
- Ridurre padding interni per compattezza
