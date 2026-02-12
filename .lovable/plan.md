

# Rifare la pagina Database e Ricettario fedele al mockup

## Differenze identificate dal mockup

### Hub "Il mio database" (img 1)
- L'icona a sinistra del titolo e' una illustrazione piu' grande (stile magazzino/scaffale), non un piccolo quadrato con icona Package
- Il bottone blu a destra ha un'icona scanner/barcode, non MessageCircle
- Le pill "Il mio ricettario" / "I miei prodotti" partono dal bordo sinistro della card (non indentate)
- Le illustrazioni nelle card sono piu' grandi e posizionate a destra
- Il layout della card "I miei prodotti" non ha il background arancione sull'icona, e' neutro

### Ricettario (img 2)
- Il titolo e' "Il mio Ricettario" con icona chef a sinistra
- Le card delle categorie sono piu' alte con il label in alto a sinistra in grassetto e l'illustrazione grande sotto
- Manca la categoria emoji - servono icone/illustrazioni piu' grandi
- C'e' una sesta card: "Aggiungi una nuova categoria" con icona "+"
- Le card hanno bordi arrotondati e piu' spazio verticale

## Modifiche tecniche

### File: `src/pages/MyProducts.tsx`

**Hub view (linee ~552-665):**
1. Sostituire l'icona Package con `Warehouse` (lucide) di dimensioni maggiori (~h-14 w-14) per approssimare l'illustrazione del mockup
2. Sostituire `MessageCircle` con `ScanLine` (icona barcode/scanner) nel bottone blu
3. Le pill label ("Il mio ricettario", "I miei prodotti") avranno `rounded-r-full rounded-l-none` e partiranno dal bordo sinistro della card (margin negativo o padding 0 a sinistra)
4. Aumentare la dimensione delle icone nelle card a ~h-16 w-16 e rimuovere il background arancione dalla card prodotti, uniformando entrambe con sfondo azzurro chiaro
5. Rendere le icone delle card piu' grandi (ChefHat, Wine) con dimensioni ~h-12 w-12

**Ricettario view (linee ~360-379):**
1. Cambiare il layout delle card categoria: label in alto a sinistra (text-left, font-bold), icona/illustrazione grande sotto centrata
2. Aumentare altezza card con padding piu' generoso (p-4, min-h piu' alto)
3. Sostituire le emoji con icone Lucide di grandi dimensioni per ogni categoria:
   - Antipasti: icone stile spiedini (usare un'icona come `UtensilsCrossed`)
   - Primi: `Soup` o simile
   - Secondi: `Beef` o simile
   - Contorni: `Salad` o simile
   - Dolci: `Cake` o `IceCream`
4. Aggiungere la sesta card "Aggiungi una nuova categoria" con icona `PlusCircle` e testo
5. Aumentare il gap tra le card a `gap-4`
6. Le card avranno `items-start` invece di `items-center` per allineare il testo a sinistra

**Header ricettario:**
1. Sostituire la freccia indietro + testo con layout simile al mockup: icona chef a sinistra + "Il mio Ricettario" come titolo

