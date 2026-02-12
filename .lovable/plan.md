

# Rimuovere la scritta "ITAL LEA" e sistemare la pagina Grafici

## Problema
1. In 3 punti di `MyProducts.tsx` c'e' la scritta "ITAL LEA" accanto al logo -- va rimossa, lasciando solo il logo (piu' grande, come nella Home)
2. La pagina Grafici (`Charts.tsx`) ha un header con emoji e testo, senza logo e senza lo stesso stile delle altre pagine

## Modifiche

### File: `src/pages/MyProducts.tsx`
Nelle 3 sezioni header (category view ~riga 346-351, ricettario ~riga 384-392, hub ~riga 706-714):
- Rimuovere lo `<span>` con "ITAL LEA"
- Ingrandire il logo da `h-9 w-9` a `h-12` con `objectFit: contain` (stesso stile di HomeHeader)
- Rimuovere `rounded-xl` dal logo (non serve, il logo ha gia' la sua forma)

### File: `src/pages/Charts.tsx`
- Importare `logoImg` dal file assets
- Sostituire l'header attuale (emoji "Grafici") con lo stesso pattern delle altre pagine:
  - Sfondo con gradiente (gia' presente)
  - Logo centrato in alto (come HomeHeader)
  - Titolo "Grafici" sotto il logo, senza emoji
