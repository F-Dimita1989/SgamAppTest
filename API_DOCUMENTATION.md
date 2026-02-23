# API Documentation - SgamApp Frontend

Documentazione completa degli endpoint API utilizzati dal frontend.

## 🔐 Autenticazione

Tutti gli endpoint admin richiedono autenticazione tramite cookie HttpOnly o Bearer token.

### Login Admin
```http
POST /api/admin/login
Content-Type: application/json

{
  "password": "admin_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token" // Opzionale, cookie HttpOnly preferito
}
```

### Verifica Autenticazione
```http
GET /api/admin/verify
```

**Response:**
```json
{
  "authenticated": true,
  "expiresAt": 1234567890
}
```

### Logout
```http
POST /api/admin/logout
```

---

## 📚 Glossario API

Base URL: `https://sgamapp.onrender.com/api/Glossary`

### Get All Terms
```http
GET /api/Glossary/GetAll
```

**Response:**
```json
[
  {
    "id": 1,
    "term": "SPID",
    "description": "Sistema Pubblico di Identità Digitale",
    "category": "Identità Digitale",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### Get Term by ID
```http
GET /api/Glossary/GetById/:id
```

### Get Term by Word
```http
GET /api/Glossary/GetByWord/:word
```

**Query Parameters:**
- `word` (string, required): Parola da cercare

**Response:**
```json
[
  {
    "id": 1,
    "term": "SPID",
    "description": "...",
    "category": "..."
  }
]
```

### Add Term (Admin)
```http
POST /api/Glossary/Add
Authorization: Bearer {token}
Content-Type: application/json

{
  "term": "Nuovo Termine",
  "description": "Descrizione del termine",
  "category": "Categoria"
}
```

### Update Term (Admin)
```http
PUT /api/Glossary/Update/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "term": "Termine Aggiornato",
  "description": "Nuova descrizione",
  "category": "Categoria"
}
```

### Delete Term (Admin)
```http
DELETE /api/Glossary/Delete/:id
Authorization: Bearer {token}
```

---

## 🔄 Traduttore Generazionale API

Base URL: `https://sgamapp.onrender.com/api/Translator`

### Get All Translations
```http
GET /api/Translator/GetAll
```

**Response:**
```json
[
  {
    "id": 1,
    "oldWord": "telefonare",
    "newWord": "chiamare",
    "descriptionWord": "Verbo moderno per telefonare"
  }
]
```

**Note:** Il frontend mappa i campi:
- `oldWord` → `boomerWord`
- `newWord` → `slangWord`
- `descriptionWord` → `description`

### Get Translation by ID
```http
GET /api/Translator/GetById/:id
```

### Get Translation by Word
```http
GET /api/Translator/GetByWord/:word
```

**Response:**
```json
{
  "id": 1,
  "oldWord": "telefonare",
  "newWord": "chiamare",
  "descriptionWord": "..."
}
```

### Add Translation (Admin)
```http
POST /api/Translator/Add
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldWord": "parola boomer",
  "newWord": "parola slang",
  "descriptionWord": "Descrizione opzionale"
}
```

### Update Translation (Admin)
```http
PUT /api/Translator/Update/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldWord": "parola aggiornata",
  "newWord": "slang aggiornato",
  "descriptionWord": "..."
}
```

### Delete Translation (Admin)
```http
DELETE /api/Translator/Delete/:id
Authorization: Bearer {token}
```

---

## 🔍 Search API

Base URL: `https://sgamapp.onrender.com/api/Search`

### Search Pages
```http
GET /api/Search/Search/:query
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Home",
    "keywords": ["home", "principale"],
    "route": "/",
    "category": "Pagine Principali"
  }
]
```

### Get All Pages
```http
GET /api/Search/GetAllPages
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Home",
    "keywords": [...],
    "route": "/",
    "category": "..."
  }
]
```

**Note:** Il frontend ha un fallback locale se il backend non è disponibile.

---

## 🤖 Chatbot API

Base URL: `https://sgamy.onrender.com`

### Analyze Text
```http
POST /analyze
Content-Type: application/json

{
  "text": "Testo da analizzare"
}
```

**Response:**
```json
{
  "response": "Risposta del chatbot",
  "error": null
}
```

### Analyze Image
```http
POST /analyze-image
Content-Type: multipart/form-data

{
  "image": File,
  "text": "Testo opzionale"
}
```

**Response:**
```json
{
  "response": "Analisi immagine",
  "error": null
}
```

---

## 🔢 Counter API (Vercel Edge Functions)

Base URL: `/api` (stesso dominio)

### Get Counter
```http
GET /api/counter
```

**Response:**
```json
{
  "count": 1234
}
```

### Increment Counter
```http
POST /api/counter-increment
```

**Response:**
```json
{
  "success": true,
  "count": 1235
}
```

---

## 🔑 Nonce API (Vercel Edge Functions)

### Get Nonce
```http
GET /api/nonce
```

**Response:**
```json
{
  "nonce": "base64-encoded-random-string"
}
```

**Note:** Usato per Content Security Policy (CSP). Generato dinamicamente per ogni richiesta.

---

## ⚠️ Error Responses

Tutti gli endpoint possono restituire errori standard HTTP:

### 400 Bad Request
```json
{
  "error": "Messaggio di errore",
  "message": "Dettagli aggiuntivi"
}
```

### 401 Unauthorized
```json
{
  "error": "Non autorizzato"
}
```

### 403 Forbidden
```json
{
  "error": "Accesso negato"
}
```

### 404 Not Found
```json
{
  "error": "Risorsa non trovata"
}
```

### 429 Too Many Requests
```json
{
  "error": "Troppe richieste. Riprova più tardi."
}
```

### 500 Internal Server Error
```json
{
  "error": "Errore del server"
}
```

---

## 🔒 Rate Limiting

### Client-Side (Frontend)
- **Login**: 5 richieste ogni 15 minuti
- **Chatbot**: 15 richieste al minuto
- **API Generiche**: 25 richieste al minuto
- **Admin**: 40 richieste al minuto

### Server-Side (Vercel Edge Functions)
- **Counter/Nonce**: 100 richieste al minuto per IP

---

## 📝 Note Importanti

1. **Content-Type**: Tutti gli endpoint JSON richiedono `Content-Type: application/json`
2. **CORS**: Configurato sul backend per permettere richieste dal frontend
3. **Authentication**: In produzione, usa cookie HttpOnly invece di token in header
4. **Sanitization**: Tutti gli input vengono sanitizzati lato frontend prima dell'invio
5. **Validation**: Validazione lato client e server (defense in depth)

---

## 🧪 Testing

Per testare gli endpoint in sviluppo:

```bash
# Avvia proxy locale
npm run dev:proxy

# In un altro terminale
npm run dev
```

Gli endpoint `/api/*` verranno reindirizzati automaticamente al backend.

---

## 📚 Riferimenti

- [Backend API Documentation](https://sgamapp.onrender.com/swagger) (se disponibile)
- [Vercel Edge Functions Docs](https://vercel.com/docs/functions/edge-functions)
- [React Router Docs](https://reactrouter.com/)

