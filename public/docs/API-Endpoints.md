# Ital-Lea — Documentazione API Endpoints

> Base URL: `https://uqnxdjehsgewuzjcwien.supabase.co/functions/v1`

Tutti gli endpoint accettano `OPTIONS` per CORS preflight.  
Header richiesto (dove indicato): `Authorization: Bearer <access_token>`

---

## 1. `lookup-barcode` — Ricerca prodotto per barcode

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | Sì (Bearer token) |
| **JWT verify** | No (validato nel codice) |

### Request body
```json
{
  "barcode": "8001505005592"
}
```

### Response (200)
```json
{
  "found": true,
  "source": "global|user|openfoodfacts",
  "name": "Pasta Barilla",
  "brand": "Barilla",
  "kcal_per_100g": 356,
  "protein_per_100g": 12.5,
  "carbs_per_100g": 71.2,
  "fat_per_100g": 1.5,
  "fiber_per_100g": 3.0,
  "salt_per_100g": 0.01,
  "image_url": "https://..."
}
```

### Response (404)
```json
{ "found": false }
```

---

## 2. `get-daily-nutrition` — Riepilogo nutrizionale giornaliero

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | Sì |
| **JWT verify** | No |

### Request body
```json
{
  "date": "2025-06-15"
}
```

### Response (200)
```json
{
  "date": "2025-06-15",
  "totals": { "kcal": 1850, "protein": 95, "carbs": 210, "fat": 65 },
  "meals": {
    "breakfast": [...],
    "lunch": [...],
    "dinner": [...],
    "snack": [...]
  }
}
```

---

## 3. `submit-nutrition-correction` — Invio correzione/nuovo prodotto

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | Sì |
| **JWT verify** | No |

### Request body
```json
{
  "barcode": "8001505005592",
  "name": "Pasta Integrale",
  "brand": "Barilla",
  "kcal_per_100g": 348,
  "protein_per_100g": 13,
  "carbs_per_100g": 65,
  "fat_per_100g": 2.5,
  "fiber_per_100g": 7.5,
  "salt_per_100g": 0.01,
  "image_url": null
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Submission received, pending admin review"
}
```

---

## 4. `ocr-nutrition-label` — OCR etichetta nutrizionale

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | Sì |
| **JWT verify** | No |

### Request body
```json
{
  "image_base64": "<base64_encoded_image>"
}
```

### Response (200)
```json
{
  "kcal_per_100g": 250,
  "protein_per_100g": 8,
  "carbs_per_100g": 45,
  "fat_per_100g": 5,
  "fiber_per_100g": 2,
  "salt_per_100g": 0.5
}
```

---

## 5. `export-user-data` — Export completo dati utente

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | Sì |
| **JWT verify** | No |

### Response (200) — JSON file download
```json
{
  "exported_at": "2025-06-15T12:00:00Z",
  "user_email": "user@example.com",
  "profile": { ... },
  "weighings": [ ... ],
  "water_logs": [ ... ],
  "weight_logs": [ ... ],
  "user_products": [ ... ],
  "recipes": [ ... ]
}
```

---

## 6. `delete-account` — Eliminazione account

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | Sì |
| **JWT verify** | No |

### Response (200)
```json
{ "success": true }
```

---

## 7. `manage-push-token` — Gestione token push notification

| | |
|---|---|
| **Metodo** | `POST` (registra) / `DELETE` (rimuovi) |
| **Auth** | Sì |
| **JWT verify** | No |

### POST — Request body
```json
{
  "token": "fcm_token_string",
  "platform": "web|android|ios"
}
```

### DELETE — Request body
```json
{
  "token": "fcm_token_string"
}
```

### Response (200)
```json
{ "success": true }
```

---

## 8. `pair-device` — Associazione bilancia IoT

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | Sì |
| **JWT verify** | No |

### Request body
```json
{
  "hardware_device_id": "DEVICE_ABC123",
  "serial_number": "SN-001"
}
```

### Response (200)
```json
{
  "success": true,
  "device_id": "uuid"
}
```

---

## 9. `device-send-weighing` — Invio pesata dal dispositivo

| | |
|---|---|
| **Metodo** | `POST` |
| **Auth** | No (autenticazione via `device_id`) |
| **JWT verify** | No |

### Request body
```json
{
  "device_id": "DEVICE_ABC123",
  "profile_index": 1,
  "barcode": "8001505005592",
  "grams": 150,
  "meal_type": "lunch"
}
```

### Response (200)
```json
{
  "success": true,
  "weighing_id": "uuid",
  "product_name": "Pasta Barilla",
  "kcal": 534
}
```

---

## 10. `device-lookup-barcode` — Ricerca barcode dal dispositivo

| | |
|---|---|
| **Metodo** | `GET` |
| **Auth** | No (autenticazione via `device_id`) |
| **JWT verify** | No |

### Query params
```
?device_id=DEVICE_ABC123&barcode=8001505005592&profile_index=1
```

### Response (200)
```json
{
  "found": true,
  "source": "global|user",
  "name": "Pasta Barilla",
  "kcal_per_100g": 356,
  "protein_per_100g": 12.5,
  "carbs_per_100g": 71.2,
  "fat_per_100g": 1.5,
  "fiber_per_100g": 3.0,
  "salt_per_100g": 0.01,
  "brand": "Barilla",
  "image_url": null
}
```

---

## 11. `device-get-recipe` — Dettaglio ricetta dal dispositivo

| | |
|---|---|
| **Metodo** | `GET` |
| **Auth** | No (autenticazione via `device_id`) |
| **JWT verify** | No |

### Query params
```
?device_id=DEVICE_ABC123&recipe_id=uuid&profile_index=1
```

### Response (200)
```json
{
  "recipe_name": "Pasta al pesto",
  "servings": 2,
  "total": { "kcal": 800, "protein": 25, "carbs": 100, "fat": 30, "grams": 500 },
  "per_serving": { "kcal": 400, "protein": 12.5, "carbs": 50, "fat": 15, "grams": 250 },
  "ingredients": [
    { "product_name": "Pasta", "grams": 200, "kcal": 712, "protein": 25, "carbs": 142, "fat": 3 }
  ]
}
```

---

## 12. `admin-manage-users` — Gestione utenti (admin)

| | |
|---|---|
| **Metodo** | `GET` (lista) / `POST` (azioni) |
| **Auth** | Sì (ruolo `admin` richiesto) |
| **JWT verify** | No |

### GET — Response (200)
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "...",
    "profile": { "first_name": "Mario", ... }
  }
]
```

### POST — Request body
```json
{
  "action": "delete|set_role",
  "user_id": "uuid",
  "role": "admin|moderator|user"
}
```

---

## 13. `admin-manage-products` — Gestione prodotti globali (admin)

| | |
|---|---|
| **Metodo** | `GET` (lista) / `POST` (azioni) |
| **Auth** | Sì (ruolo `admin` richiesto) |
| **JWT verify** | No |

### POST — Request body
```json
{
  "action": "approve|reject|edit|delete",
  "submission_id": "uuid",
  "product_data": { ... }
}
```

---

## 14. `admin-send-notification` — Invio notifiche broadcast (admin)

| | |
|---|---|
| **Metodo** | `GET` (storico) / `POST` (invio) |
| **Auth** | Sì (ruolo `admin` richiesto) |
| **JWT verify** | No |

### POST — Request body
```json
{
  "title": "Aggiornamento app",
  "message": "Nuova versione disponibile!",
  "url": "https://itallea.lovable.app"
}
```

### Response (200)
```json
{
  "success": true,
  "sent_to_count": 142
}
```

---

## Tabelle database principali

| Tabella | Descrizione |
|---------|-------------|
| `profiles` | Dati profilo utente (target, misure, preferenze) |
| `weighings` | Pesate alimenti registrate |
| `water_logs` | Log idratazione giornaliera |
| `weight_logs` | Storico peso corporeo |
| `products` | Prodotti globali (catalogo condiviso) |
| `user_products` | Prodotti personalizzati dall'utente |
| `product_submissions` | Correzioni/nuovi prodotti in attesa di review |
| `recipes` | Ricette utente |
| `recipe_ingredients` | Ingredienti delle ricette |
| `devices` | Bilance IoT associate |
| `device_profiles` | Profili utente per dispositivo (multi-user) |
| `notifications` | Storico notifiche admin |
| `push_tokens` | Token FCM per push notifications |
| `user_roles` | Ruoli utente (admin, moderator, user) |
| `user_recipe_categories` | Categorie ricette personalizzate |

---

## Note per lo sviluppo

- **CORS**: Tutti gli endpoint includono header `Access-Control-Allow-Origin: *`
- **JWT**: Nessun endpoint usa `verify_jwt` a livello di gateway; l'autenticazione è gestita nel codice tramite `supabase.auth.getUser()`
- **Endpoint dispositivo**: `device-*` non richiedono Bearer token; si autenticano via `hardware_device_id` verificato contro la tabella `devices`
- **RLS**: Tutte le tabelle hanno Row Level Security attivo; le policy sono basate su `auth.uid()` o sul ruolo `admin`
- **Enum `meal_type`**: `breakfast | lunch | dinner | snack`
- **Enum `app_role`**: `admin | moderator | user`
