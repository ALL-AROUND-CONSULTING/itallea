

# Aggiunta Scanner QR per Pairing Bilancia

## Situazione Attuale

- Il banner "Aggiungi dispositivo" in Home naviga a `/settings` dove c'e' solo un campo di testo per inserire il codice manualmente
- Il documento tecnico specifica che il pairing deve avvenire "tramite la scansione del QR code" (sezione 3.1 e pagina 35)
- Lo scanner barcode esiste gia' in `src/pages/Scan.tsx` con tutta la logica Html5Qrcode

## Piano di Implementazione

### 1. Creare pagina dedicata per il pairing: `src/pages/PairDevice.tsx`

Una schermata fullscreen simile a `Scan.tsx` ma ottimizzata per QR code:
- Header con freccia indietro e titolo "Collega la tua bilancia"
- Area fotocamera fullscreen con brackets di inquadratura (quadrati, non rettangolari come per i barcode)
- Pulsante "Inserimento manuale" in basso per chi non riesce a scansionare
- Overlay manuale con campo di testo per il codice dispositivo
- Dopo la scansione del QR: chiama l'endpoint `pair-device` con il `hardware_device_id` letto dal QR
- In caso di successo: mostra toast di conferma e naviga alla home
- In caso di errore (409 = gia' associato ad altro utente): mostra messaggio appropriato

La logica della fotocamera riutilizzera' lo stesso pattern di `Scan.tsx` (ref `isScannerRunning`, cleanup, start/stop).

### 2. Aggiornare routing in `src/App.tsx`

- Aggiungere la route `/pair-device` protetta (richiede autenticazione)
- Importare il nuovo componente `PairDevice`

### 3. Aggiornare il banner Home in `src/components/dashboard/DeviceBanner.tsx`

- Cambiare la navigazione del banner "Aggiungi dispositivo": da `navigate("/settings")` a `navigate("/pair-device")`
- Il badge "Il mio dispositivo" continua a navigare a `/settings` per gestione/disconnessione

### 4. Aggiornare pagina Impostazioni in `src/pages/Settings.tsx`

- Aggiungere un pulsante "Collega bilancia" che naviga a `/pair-device` (quando non c'e' un dispositivo collegato)
- Mantenere anche l'input manuale come opzione alternativa

---

## Sezione Tecnica

### File da creare:
- `src/pages/PairDevice.tsx` — Schermata scanner QR con:
  - Html5Qrcode configurato per QR (non solo barcode)
  - `qrbox` quadrato (220x220) per QR code
  - Chiamata a `pair-device` POST con `{ hardware_device_id: decodedText }`
  - Fallback inserimento manuale del codice
  - Gestione stati: scanning, loading, success, error (409/500)

### File da modificare:
- `src/App.tsx` — Aggiungere route `/pair-device`
- `src/components/dashboard/DeviceBanner.tsx` — Banner "Aggiungi dispositivo" naviga a `/pair-device`
- `src/pages/Settings.tsx` — Pulsante "Collega bilancia" naviga a `/pair-device` quando nessun dispositivo presente

### Logica conservata:
- L'endpoint `pair-device` resta invariato (gia' supporta il pairing)
- La disconnessione resta in Impostazioni
- Il banner Home mostra il dispositivo connesso se presente

