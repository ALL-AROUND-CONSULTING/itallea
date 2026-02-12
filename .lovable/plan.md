
# Bottom Sheet con animazione dal FAB (+)

## Cosa cambia
Quando si clicca il FAB (+) nella navbar, invece di aprire direttamente il `WeighingModal`, si apre un **bottom sheet** (drawer) che sale dal basso con animazione fluida, contenente:

1. **Due card affiancate grandi**:
   - "Registra alimento" con icona lente (Search) in cerchio blu -- apre il WeighingModal
   - "Scansiona codice a barre" con icona barcode (ScanLine) in cerchio blu -- naviga a /scan

2. **Lista sotto**:
   - "Acqua" con icona gocciolina -- apre logica acqua
   - "Peso" con icona bilancia -- apre input peso

## Implementazione tecnica

### Nuovo file: `src/components/layout/QuickActionSheet.tsx`
- Usa il componente `Drawer` (vaul) gia presente nel progetto
- Contenuto:
  - Due card (`rounded-2xl border bg-card`) affiancate in una griglia `grid-cols-2 gap-3`
  - Ogni card ha un cerchio blu con icona bianca centrata + testo sotto
  - Sotto le card: lista con righe "Acqua" e "Peso" con icone a sinistra, bordi arrotondati, sfondo card
- Al click su "Registra alimento": chiude il drawer e apre `WeighingModal`
- Al click su "Scansiona codice a barre": chiude il drawer e naviga a `/scan`
- Al click su "Acqua": chiude il drawer e gestisce log acqua (o naviga)
- Al click su "Peso": chiude il drawer e apre input peso

### Modifica: `src/components/layout/BottomNav.tsx`
- Il FAB ora apre il `QuickActionSheet` invece del `WeighingModal` direttamente
- Stato `sheetOpen` sostituisce `weighingOpen` come primo step
- Il `WeighingModal` viene aperto solo quando si seleziona "Registra alimento" dal sheet

### Animazione
- Vaul Drawer fornisce gia animazione slide-up fluida nativa
- Il drawer appare dal basso con overlay scuro semi-trasparente
- Handle/grabber in alto per chiusura drag
