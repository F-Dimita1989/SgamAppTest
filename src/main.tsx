import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initializeNonce } from './utils/nonce';
import { registerServiceWorker } from './utils/serviceWorker';

const Analytics = lazy(() =>
  import('@vercel/analytics/react').then(m => ({ default: m.Analytics }))
);
const SpeedInsights = lazy(() =>
  import('@vercel/speed-insights/react').then(m => ({ default: m.SpeedInsights }))
);

if (import.meta.env.PROD) {
  import('./utils/sentry').then(m => m.initSentry()).catch(() => {});

  initializeNonce().catch(() => {});
  registerServiceWorker();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Suspense fallback={null}>
      <Analytics />
      <SpeedInsights />
    </Suspense>
  </StrictMode>,
);

function scheduleIdleTask(task: () => void, timeout: number): void {
  if ('requestIdleCallback' in window) {
    (window as Window & {
      requestIdleCallback: (cb: () => void, opts?: { timeout?: number }) => number;
    }).requestIdleCallback(task, { timeout });
  } else {
    setTimeout(task, 100);
  }
}

scheduleIdleTask(() => {
  import('./utils/browserDetection').then(m => m.initBrowserDetection()).catch(() => {});
}, 3000);

if (document.readyState === 'complete') {
  loadNonCriticalScripts();
} else {
  window.addEventListener('load', loadNonCriticalScripts, { once: true });
}

function loadNonCriticalScripts(): void {
  scheduleIdleTask(() => {
    import('./utils/resourcePrefetch').then(m => m.prefetchCommonResources()).catch(() => {});
  }, 2000);
}
