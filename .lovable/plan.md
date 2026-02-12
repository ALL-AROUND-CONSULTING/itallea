

# Sostituire le icone con illustrazioni SVG fedeli al mockup

## Problema
Le icone attuali sono icone Lucide (linee sottili, monocromatiche) mentre il mockup mostra illustrazioni flat design colorate, piu' grandi e dettagliate.

## Soluzione

### 1. Creare un file di componenti SVG illustrazione
**Nuovo file: `src/components/illustrations/DatabaseIllustrations.tsx`**

Creare componenti SVG inline che riproducano lo stile flat/illustrated del mockup:

- **WarehouseIllustration**: Scaffale/magazzino con prodotti (per il titolo "Il mio database")
- **RecipeBookIllustration**: Cappello da chef con piatto/cucchiaio (per la card ricettario)
- **GroceryIllustration**: Bottiglia/barattolo con alimenti (per la card prodotti)
- **AntipastiIllustration**: Tagliere con spiedini/bruschette
- **PrimiIllustration**: Piatto di pasta fumante
- **SecondiIllustration**: Bistecca/carne su piatto
- **ContorniIllustration**: Insalata/verdure colorate
- **DolciIllustration**: Torta/cupcake decorato

Ogni SVG avra':
- Colori pieni (fill) invece di solo stroke
- Palette coerente: blu brand, azzurro chiaro, bianco, accenti arancio/verde
- Dimensioni generose (60-80px)
- Stile flat design con ombre morbide

### 2. Aggiornare `src/pages/MyProducts.tsx`
- Importare le nuove illustrazioni al posto delle icone Lucide (Warehouse, ChefHat, Wine, UtensilsCrossed, Soup, Beef, Salad, Cake)
- Sostituire ogni `<LucideIcon>` con il corrispondente componente illustrazione
- Aggiornare il type `RecipeCategory` per usare i nuovi componenti
- Mantenere PlusCircle di Lucide solo per la card "Aggiungi categoria" (coerente col mockup)

### Dettaglio tecnico delle illustrazioni SVG

Ogni componente sara' un SVG React component con props `className` e `style` per flessibilita'. Le illustrazioni useranno forme geometriche semplici (rettangoli arrotondati, cerchi, path) con fill colorati per ottenere l'aspetto flat design del mockup, senza dipendenze esterne.

