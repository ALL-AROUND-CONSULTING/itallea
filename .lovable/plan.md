

# Navbar con bordi arrotondati come dal mockup

## Problema
La navbar attuale ha un bordo superiore piatto (`border-t`). Nel mockup invece ha **angoli superiori arrotondati** (stile card flottante) con un'ombra verso l'alto, senza bordo inferiore visibile.

## Modifiche

### `src/components/layout/BottomNav.tsx`
- Rimuovere `border-t border-border` dal `<nav>`
- Aggiungere `rounded-t-2xl` (o `rounded-t-3xl`) per gli angoli superiori arrotondati
- Aggiungere un'ombra verso l'alto (`shadow-[0_-2px_10px_rgba(0,0,0,0.06)]`) per l'effetto di elevazione sottile visibile nel mockup
- Mantenere tutto il resto invariato (FAB, icone, labels, colori attivi)

