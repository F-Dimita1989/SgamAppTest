# 🚀 Guida Deployment Vercel

Guida completa per deployare SgamApp Frontend su Vercel.

## 📋 Prerequisiti

1. Account Vercel ([vercel.com](https://vercel.com))
2. Repository GitHub/GitLab/Bitbucket
3. Backend API già deployato (sgamapp.onrender.com)

## 🔧 Setup Iniziale

### 1. Connetti Repository

1. Vai su [Vercel Dashboard](https://vercel.com/dashboard)
2. Clicca **"Add New Project"**
3. Importa il repository GitHub/GitLab
4. Vercel rileverà automaticamente:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Configura Environment Variables

Vai su **Settings → Environment Variables** e aggiungi:

#### Variabili Obbligatorie

```
VITE_API_BASE_URL=https://sgamapp.onrender.com/api
VITE_CHATBOT_API_BASE_URL=https://sgamy.onrender.com
```

#### Variabili Opzionali

```
VITE_SENTRY_DSN=your-sentry-dsn-here (per error tracking)
VITE_ENABLE_CONSOLE_LOGS=false (default: false)
```

**Nota**: Aggiungi le stesse variabili per:

- **Production**
- **Preview** (opzionale)
- **Development** (opzionale)

### 3. Build Settings

Verifica che siano corretti:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x o superiore

## 🚀 Deploy

### Deploy Automatico

Ogni push su `main` branch triggera automaticamente un deploy.

```bash
git push origin main
```

### Deploy Manuale

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy produzione
vercel --prod
```

## ✅ Verifica Deployment

Dopo il deploy, verifica:

1. **Homepage**: `https://your-project.vercel.app`
2. **Console Browser**: Nessun errore JavaScript
3. **Network Tab**: API calls funzionanti
4. **Security Headers**: Verifica con [securityheaders.com](https://securityheaders.com)

## 🔒 Security Headers

Il progetto include già security headers in `vercel.json`:

- ✅ Content-Security-Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Strict-Transport-Security
- ✅ Referrer-Policy
- ✅ Permissions-Policy

## 📊 Monitoring

### Vercel Analytics

Automaticamente abilitato. Monitora:

- Visite
- Performance
- Errori

### Speed Insights

Automaticamente abilitato. Monitora:

- Core Web Vitals
- LCP, FID, CLS

### Sentry (Opzionale)

1. Crea progetto su [sentry.io](https://sentry.io)
2. Aggiungi `VITE_SENTRY_DSN` in Vercel
3. Gli errori verranno tracciati automaticamente

## 🐛 Troubleshooting

### Build Fails

**Errore**: `Module not found`

```bash
# Soluzione: Pulisci cache
rm -rf node_modules .vercel
npm install
```

**Errore**: `TypeScript errors`

```bash
# Verifica localmente
npm run type-check
```

### Runtime Errors

**Errore**: `API calls failing`

- Verifica `VITE_API_BASE_URL` in Vercel
- Verifica CORS sul backend
- Controlla Network tab nel browser

**Errore**: `CSP blocking scripts`

- Verifica che `api/app.ts` generi nonce correttamente
- Controlla console per errori CSP

### Performance Issues

1. **Verifica Bundle Size**

   ```bash
   npm run build
   # Controlla output per chunk sizes
   ```

2. **Verifica Lazy Loading**

   - Network tab → Verifica che componenti si carichino on-demand

3. **Verifica Caching**
   - Assets dovrebbero avere cache headers (configurato in `vercel.json`)

## 🔄 Continuous Deployment

### Branch Strategy

- `main` → Production (deploy automatico)
- `develop` → Preview (deploy automatico)
- Altri branch → Preview (opzionale)

### Preview Deployments

Ogni PR genera automaticamente un preview deployment:

- URL: `https://your-project-git-branch.vercel.app`
- Utile per testing prima di merge

## 📈 Performance Optimization

### Vercel Automatic Optimizations

- ✅ Edge Network (CDN globale)
- ✅ Automatic HTTPS
- ✅ HTTP/2
- ✅ Compression (gzip/brotli)
- ✅ Image Optimization (se configurato)

### Manual Optimizations

1. **Code Splitting**: Già configurato in `vite.config.ts`
2. **Lazy Loading**: Già implementato
3. **Service Worker**: Già configurato per PWA

## 🔐 Environment Variables Best Practices

1. **Non committare** `.env` files
2. **Usa Vercel Dashboard** per variabili sensibili
3. **Differenzia** Production/Preview/Development
4. **Rigenera** secrets periodicamente

## 📝 Post-Deployment Checklist

- [ ] Homepage carica correttamente
- [ ] API calls funzionano
- [ ] Authentication funziona
- [ ] Admin panel accessibile
- [ ] Mobile responsive
- [ ] Security headers presenti
- [ ] Analytics attivo
- [ ] Error tracking configurato (se Sentry)
- [ ] Performance accettabile (Lighthouse > 90)

## 🆘 Support

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [GitHub Issues](https://github.com/your-repo/issues)

---

**Note**: Questo progetto è ottimizzato per Vercel. Per altri provider (Netlify, AWS, etc.) potrebbe essere necessaria configurazione aggiuntiva.
