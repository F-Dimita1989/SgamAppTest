import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChatbotProvider } from './contexts/ChatbotContext';
import { AuthProvider } from './contexts/AuthContext';

import AccessibilityLoader from './components/shared/AccessibilityLoader';
import Navbar from './components/shared/Navbar';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Lazy load componenti non critici (caricati solo quando necessari)
const ScrollToTop = lazy(() => import('./components/shared/ScrollToTop'));
const DocumentTitle = lazy(() => import('./components/shared/DocumentTitle'));
const SEOHead = lazy(() => import('./components/shared/SEOHead'));

// Lazy load componenti non critici (non nel viewport iniziale)
// Questi componenti vengono caricati solo quando necessari, riducendo il bundle iniziale
const Footer = lazy(() => import('./components/shared/Footer'));
const ChatbotModal = lazy(() => import('./components/shared/ChatbotModal'));
const ChatbotButton = lazy(() => import('./components/shared/ChatbotButton'));
const ScrollToTopButton = lazy(() => import('./components/shared/ScrollToTopButton'));
const AppDownloadBanner = lazy(() => import('./components/shared/AppDownloadBanner'));
const CookieBanner = lazy(() => import('./components/shared/CookieBanner'));

// Lazy load delle pagine principali
const Home = lazy(() => import('./components/pages/Home'));
const Glossario = lazy(() => import('./components/pages/Glossario'));
const TraduttoreGenerazionale = lazy(() => import('./components/pages/TraduttoreGenerazionale'));
const Info = lazy(() => import('./components/pages/Info'));
const AntiFrode = lazy(() => import('./components/pages/AntiFrode'));
const Guide = lazy(() => import('./components/pages/Guide'));
const GuidaSpid = lazy(() => import('./components/pages/GuidaSpid'));
const GuidaPec = lazy(() => import('./components/pages/GuidaPEC'));
const GuidaCie = lazy(() => import('./components/pages/GuidaCIE'));
const GuidaSicurezza = lazy(() => import('./components/pages/GuidaSicurezza'));
const GuidaPrimoAccesso = lazy(() => import('./components/pages/GuidaPrimoAccesso'));
const GuidaRecuperoPassword = lazy(() => import('./components/pages/GuidaRecuperoPassword'));
const GuidaCertificatiOnline = lazy(() => import('./components/pages/GuidaCertificatiOnline'));
const GuidaPagamentiDMSanitari = lazy(() => import('./components/pages/GuidaPagamentiDMSanitari'));
const GuidaAnagrafeDigitale = lazy(() => import('./components/pages/GuidaAnagrafeDigitale'));
const GuidaPrenotazioniASL = lazy(() => import('./components/pages/GuidaPrenotazioniASL'));
const PrivacyPolicy = lazy(() => import('./components/pages/Privacy'));
const Error404 = lazy(() => import('./components/pages/Error404'));

// Admin Pages - Lazy loaded
const AdminLogin = lazy(() => import('./components/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/pages/AdminDashboard'));
const AdminGlossario = lazy(() => import('./components/pages/AdminGlossario'));
const AdminTraduttore = lazy(() => import('./components/pages/AdminTraduttore'));

/**
 * Componente di loading per le pagine lazy-loaded
 */
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '50vh',
    color: 'var(--colore-primario)'
  }}>
    <div style={{ 
      width: '48px', 
      height: '48px', 
      border: '4px solid rgba(var(--colore-primario-rgb), 0.1)', 
      borderTop: '4px solid var(--colore-primario)', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite' 
    }} />
  </div>
);

/**
 * Componente principale dell'applicazione
 * 
 * Gestisce:
 * - Routing con React Router
 * - Lazy loading dei componenti
 * - Context providers (Auth, Chatbot)
 * - Layout con Navbar e Footer
 */
function App() {
  return (
    <AuthProvider>
      <ChatbotProvider>
        <AccessibilityLoader />
        <Router>
          <Suspense fallback={null}>
            <DocumentTitle />
            <SEOHead />
          </Suspense>
          <Routes>
            {/* Admin Routes - Hidden, no navbar/footer */}
            <Route 
              path="/sgam-admin-login" 
              element={
                <>
                  <Suspense fallback={null}>
                    <ScrollToTop />
                  </Suspense>
                  <Suspense fallback={<PageLoader />}>
                    <AdminLogin />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ScrollToTopButton />
                  </Suspense>
                </>
              } 
            />
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  <Suspense fallback={null}>
                    <ScrollToTop />
                  </Suspense>
                  <Suspense fallback={<PageLoader />}>
                    <AdminDashboard />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ScrollToTopButton />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/glossario"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ScrollToTop />
                    <AdminGlossario />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ScrollToTopButton />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/traduttore"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ScrollToTop />
                    <AdminTraduttore />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ScrollToTopButton />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Public Routes - with navbar/footer */}
            <Route
              path="/*"
              element={
                <>
                  <Suspense fallback={null}>
                    <ScrollToTop />
                  </Suspense>
                  <a href="#main-content" className="skip-to-main">
                    Salta al contenuto principale
                  </a>
                  <Navbar />
                  <main className="main-content" id="main-content">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/servizio-antifrode" element={<AntiFrode />} />

                        {/* Mostra i card delle guide */}
                        <Route path="/guide" element={<Guide />} />

                        {/* Guide singole */}
                        <Route path="/guide/spid" element={<GuidaSpid />} />
                        <Route path="/guide/pec" element={<GuidaPec />} />
                        <Route path="/guide/cie" element={<GuidaCie />} />
                        <Route path="/guide/sicurezza" element={<GuidaSicurezza />} />
                        <Route path="/guide/primo-accesso" element={<GuidaPrimoAccesso />} />
                        <Route path="/guide/recupero-password" element={<GuidaRecuperoPassword />} />
                        <Route path="/guide/certificati-online" element={<GuidaCertificatiOnline />} />
                        <Route path="/guide/pagamenti-dm-sanitari" element={<GuidaPagamentiDMSanitari />} />
                        <Route path="/guide/anagrafe-digitale" element={<GuidaAnagrafeDigitale />} />
                        <Route path="/guide/prenotazioni-asl-puglia" element={<GuidaPrenotazioniASL />} />
                        <Route path="/guide/asl" element={<GuidaPrenotazioniASL />} />

                        <Route path="/glossario" element={<Glossario />} />
                        <Route path="/traduttore-generazionale" element={<TraduttoreGenerazionale />} />
                        <Route path="/info" element={<Info />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />

                        <Route path="*" element={<Error404 />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Suspense fallback={null}>
                    <Footer />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ChatbotModal />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ChatbotButton />
                  </Suspense>
                  <Suspense fallback={null}>
                    <ScrollToTopButton />
                  </Suspense>
                  <Suspense fallback={null}>
                    <AppDownloadBanner />
                  </Suspense>
                  <Suspense fallback={null}>
                    <CookieBanner />
                  </Suspense>
                </>
              }
            />
          </Routes>
        </Router>
      </ChatbotProvider>
    </AuthProvider>
  );
}

export default App;
