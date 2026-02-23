/**
 * Configurazione Sentry per error tracking
 * Compatibile con Vercel deployment
 */

import * as Sentry from '@sentry/react'

let isInitialized = false

/**
 * Inizializza Sentry solo in produzione e se DSN è configurato
 */
export function initSentry(): void {
  // Non inizializzare se già fatto o se in sviluppo senza DSN
  if (isInitialized) return

  const dsn = import.meta.env.VITE_SENTRY_DSN
  const environment = import.meta.env.MODE || 'development'
  const isProduction = import.meta.env.PROD

  // Inizializza solo se DSN è presente (opzionale)
  if (dsn && isProduction) {
    Sentry.init({
      dsn,
      environment,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% delle transazioni
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% delle sessioni
      replaysOnErrorSampleRate: 1.0, // 100% delle sessioni con errori
      // Filtra errori comuni
      ignoreErrors: [
        // Errori di rete comuni
        'NetworkError',
        'Failed to fetch',
        'Network request failed',
        // Errori di CORS
        'CORS',
        // Errori di timeout
        'Timeout',
        'timeout',
        // Errori di browser
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
      beforeSend(event, hint) {
        // Filtra errori in base al contesto
        const error = hint.originalException
        
        // Ignora errori di validazione comuni
        if (error instanceof Error) {
          if (error.message.includes('validation') || error.message.includes('Validation')) {
            return null
          }
        }
        
        return event
      },
    })
    
    isInitialized = true
  }
}

/**
 * Captura un'eccezione manualmente
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isInitialized) return
  
  Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  })
}

/**
 * Captura un messaggio
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  if (!isInitialized) return
  
  Sentry.captureMessage(message, level)
}

/**
 * Aggiunge breadcrumb per debugging
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  if (!isInitialized) return
  
  Sentry.addBreadcrumb(breadcrumb)
}

/**
 * Imposta contesto utente (senza dati sensibili)
 */
export function setUser(user: { id?: string; username?: string } | null): void {
  if (!isInitialized) return
  
  Sentry.setUser(user)
}

