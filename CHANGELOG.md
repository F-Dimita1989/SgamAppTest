# Changelog

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

## [Unreleased] - 2024

### Added
- ✅ Configurazione test con Vitest e React Testing Library
- ✅ Error tracking con Sentry (opzionale)
- ✅ Performance monitoring con Vercel Analytics e Speed Insights
- ✅ Test base per utilities critiche (sanitize, validation)
- ✅ README completo con setup e deployment
- ✅ Documentazione API completa
- ✅ Guida deployment Vercel
- ✅ Rimozione completa di sessionStorage per token (sicurezza migliorata)

### Changed
- 🔒 **SICUREZZA**: Token non salvati più in sessionStorage, solo in memory (dev) o HttpOnly cookie (prod)
- 📝 Logger migliorato con integrazione Sentry
- 🧪 Error handler migliorato con integrazione Sentry

### Security
- 🔒 Token authentication: Rimosso storage in sessionStorage
- 🔒 Token gestiti solo tramite HttpOnly cookies in produzione
- 🔒 Memory storage solo in sviluppo (viene perso al refresh)

## [Previous Versions]

### Features
- Lazy loading componenti
- Code splitting ottimizzato
- Service Worker per PWA
- Rate limiting client e server
- Sanitizzazione input con DOMPurify
- Validazione input avanzata
- Security headers completi
- CSP con nonce dinamico

---

**Formato basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/)**

