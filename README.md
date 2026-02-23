# SgamApp Frontend

Frontend React/TypeScript per SgamApp - piattaforma di sicurezza digitale con guide pratiche, glossario e traduttore generazionale.

## 🚀 Caratteristiche

- **React 19** con TypeScript
- **Vite** per build veloce
- **React Router** per routing
- **Lazy Loading** per performance ottimali
- **PWA Ready** con Service Worker
- **Security First**: Sanitizzazione input, validazione, CSP headers
- **Error Tracking** con Sentry
- **Performance Monitoring** con Vercel Analytics e Speed Insights
- **Testing** con Vitest e React Testing Library

## 📋 Prerequisiti

- Node.js >= 18.x
- npm >= 9.x

## 🛠️ Installazione

```bash
# Clona il repository
git clone <repository-url>
cd SgamAppFrontEnd

# Installa le dipendenze
npm install
```

## 🏃 Sviluppo

```bash
# Avvia il server di sviluppo
npm run dev

# Avvia con proxy per backend locale
npm run dev:all

# Type checking
npm run type-check

# Linting
npm run lint
```

### 🔐 Login Admin in Sviluppo

Il sistema prova **sempre** a connettersi al backend online (`https://sgamapp.onrender.com`) tramite il proxy Vite.

#### Come Funziona

1. Il proxy Vite reindirizza automaticamente `/api/*` al backend su Render
2. Usa la password admin del backend per accedere
3. Il fallback dev viene usato **SOLO** se il backend non è raggiungibile (errore di rete)

#### Fallback Dev (Solo se Backend Non Raggiungibile)

Se il backend non è disponibile e vuoi testare localmente:

1. Crea un file `.env.local` nella root del progetto
2. Aggiungi:
   ```
   VITE_DEV_ADMIN_PASSWORD=tua-password-sviluppo
   ```
3. Riavvia il server di sviluppo (`npm run dev`)
4. Usa la password configurata per accedere

**⚠️ Nota**: Il fallback dev funziona SOLO se il backend non è raggiungibile (errore di rete). Se il backend risponde (anche con errore 401), viene usato il backend reale.

## 🧪 Testing

```bash
# Esegui i test
npm test

# Test con UI
npm run test:ui

# Test con coverage
npm run test:coverage

# Test una sola volta (CI)
npm run test:run
```

**Nota**: I file di test sono esclusi dal build di produzione tramite `tsconfig.app.json`. I test usano `tsconfig.test.json` con configurazione separata.

## 🏗️ Build

```bash
# Build per produzione
npm run build

# Preview della build
npm run preview
```

## 🌐 Deployment su Vercel

### Setup Iniziale

1. **Connetti il repository a Vercel**

   - Vai su [Vercel Dashboard](https://vercel.com)
   - Importa il repository GitHub/GitLab
   - Vercel rileverà automaticamente Vite

2. **Configura Environment Variables**

   Aggiungi queste variabili in Vercel Dashboard → Settings → Environment Variables:

   ```
   VITE_API_BASE_URL=https://sgamapp.onrender.com/api
   VITE_CHATBOT_API_BASE_URL=https://sgamy.onrender.com
   VITE_SENTRY_DSN=your-sentry-dsn (opzionale)
   VITE_ENABLE_CONSOLE_LOGS=false (opzionale, default: false)
   ```

3. **Deploy**
   - Push su `main` branch → Deploy automatico
   - Oppure usa `vercel` CLI:
     ```bash
     npm i -g vercel
     vercel
     ```

### Configurazione Vercel

Il progetto include già:

- ✅ `vercel.json` con security headers
- ✅ Edge Functions in `/api`
- ✅ Automatic HTTPS
- ✅ CDN globale

### Build Settings (Vercel)

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 📁 Struttura Progetto

```
src/
├── apiServices/      # Servizi API (chatbot, etc.)
├── components/       # Componenti React
│   ├── pages/       # Pagine principali
│   └── shared/      # Componenti condivisi
├── contexts/        # React Context (Auth, Chatbot)
├── hooks/           # Custom hooks
├── test/            # Test files
├── utils/           # Utilities (sanitize, validation, etc.)
└── assets/          # Immagini e risorse statiche

api/                 # Vercel Edge Functions
├── app.ts           # Handler principale con CSP
├── counter.ts       # API counter
└── nonce.ts        # Generazione nonce CSP
```

## 🔒 Sicurezza

### Implementazioni di Sicurezza

- ✅ **Content Security Policy (CSP)** con nonce dinamico
- ✅ **Sanitizzazione Input** con DOMPurify
- ✅ **Validazione Input** lato client
- ✅ **HttpOnly Cookies** per autenticazione
- ✅ **Rate Limiting** client e server
- ✅ **Security Headers** completi (HSTS, X-Frame-Options, etc.)
- ✅ **Error Handling** sicuro (non espone dettagli in produzione)

### Headers di Sicurezza

Configurati in `vercel.json` e `api/app.ts`:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`
- `Referrer-Policy`
- `Permissions-Policy`

## 📡 API Endpoints

### Backend Principale (`https://sgamapp.onrender.com/api`)

#### Glossario

- `GET /Glossary/GetAll` - Lista tutti i termini
- `GET /Glossary/GetById/:id` - Termine per ID
- `GET /Glossary/GetByWord/:word` - Ricerca per parola
- `POST /Glossary/Add` - Aggiungi termine (admin)
- `PUT /Glossary/Update/:id` - Aggiorna termine (admin)
- `DELETE /Glossary/Delete/:id` - Elimina termine (admin)

#### Traduttore Generazionale

- `GET /Translator/GetAll` - Lista tutte le traduzioni
- `GET /Translator/GetById/:id` - Traduzione per ID
- `GET /Translator/GetByWord/:word` - Ricerca per parola
- `POST /Translator/Add` - Aggiungi traduzione (admin)
- `PUT /Translator/Update/:id` - Aggiorna traduzione (admin)
- `DELETE /Translator/Delete/:id` - Elimina traduzione (admin)

#### Admin

- `POST /admin/login` - Login admin
- `GET /admin/verify` - Verifica autenticazione
- `POST /admin/logout` - Logout

#### Search

- `GET /Search/Search/:query` - Ricerca pagine
- `GET /Search/GetAllPages` - Lista tutte le pagine

### Chatbot API (`https://sgamy.onrender.com`)

- `POST /analyze` - Analizza testo
- `POST /analyze-image` - Analizza immagine

### Vercel Edge Functions (`/api`)

- `GET /api/nonce` - Genera nonce CSP
- `GET /api/counter` - Contatore visite
- `POST /api/counter-increment` - Incrementa contatore

## 🧩 Componenti Principali

### Pages

- `Home` - Pagina principale
- `Glossario` - Dizionario termini digitali
- `TraduttoreGenerazionale` - Traduzione boomer/slang
- `AntiFrode` - Servizio protezione frodi
- `Guide/*` - Guide pratiche (SPID, PEC, CIE, etc.)
- `Admin*` - Pannello amministrazione

### Shared Components

- `Navbar` - Navigazione principale
- `Footer` - Footer con link
- `ChatbotModal` - Assistente digitale Sgamy
- `CookieBanner` - Banner cookie GDPR
- `AppDownloadBanner` - Banner download app

## 🔧 Utilities

### `sanitize.ts`

Sanitizzazione input/output HTML con DOMPurify

### `validation.ts`

Validazione input con controlli di sicurezza

### `api.ts`

Client API con gestione errori e validazione

### `rateLimiter.ts`

Rate limiting lato client

### `sentry.ts`

Configurazione error tracking (opzionale)

### `logger.ts`

Logger sicuro (disabilitato in produzione)

## 📊 Monitoring

### Sentry (Opzionale)

1. Crea progetto su [Sentry.io](https://sentry.io)
2. Aggiungi `VITE_SENTRY_DSN` in Vercel
3. Gli errori verranno tracciati automaticamente

### Vercel Analytics

- **Analytics**: Tracciamento visite (automatico)
- **Speed Insights**: Performance monitoring (automatico)

## 🐛 Troubleshooting

### Build Errors

```bash
# Pulisci cache e reinstalla
rm -rf node_modules dist
npm install
npm run build
```

### Test Errors

```bash
# Pulisci cache test
rm -rf node_modules/.vite
npm test
```

### CORS Issues

Il proxy in sviluppo gestisce CORS automaticamente. In produzione, assicurati che il backend abbia CORS configurato correttamente.

## 📝 Scripts Disponibili

- `npm run dev` - Sviluppo
- `npm run build` - Build produzione
- `npm run preview` - Preview build
- `npm run test` - Test watch mode
- `npm run test:run` - Test una volta (CI)
- `npm run test:coverage` - Coverage report
- `npm run lint` - Linting
- `npm run type-check` - Type checking

## 🤝 Contribuire

1. Fork il repository
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

[Specifica la licenza del progetto]

## 👥 Team

SgamApp Development Team

---

**Note**: Questo progetto è ottimizzato per deployment su Vercel. Per altri provider, potrebbe essere necessaria configurazione aggiuntiva.
