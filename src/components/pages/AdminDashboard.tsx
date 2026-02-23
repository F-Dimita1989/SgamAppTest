import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PersonIcon, 
  ExitIcon, 
  FileTextIcon, 
  ChatBubbleIcon,
  PlusIcon,
  DownloadIcon,
  ReloadIcon,
  CheckIcon,
  CrossCircledIcon
} from '@radix-ui/react-icons';
import { glossaryApi, translatorApi, type GlossaryTerm, type TranslationResult } from '../../apiServices/api';
import { handleApiError } from '../../utils/errorHandler';
import { logger } from '../../utils/logger';
import './AdminDashboard.css';

interface DashboardStats {
  glossaryTotal: number;
  translatorTotal: number;
  glossaryCategories: Record<string, number>;
  recentGlossaryTerms: GlossaryTerm[];
  recentTranslations: TranslationResult[];
  isLoading: boolean;
  error: string | null;
}

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    glossaryTotal: 0,
    translatorTotal: 0,
    glossaryCategories: {},
    recentGlossaryTerms: [],
    recentTranslations: [],
    isLoading: true,
    error: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsRefreshing(true);
      setStats(prev => ({ ...prev, isLoading: true, error: null }));

      // Carica dati in parallelo
      const [glossaryData, translatorData] = await Promise.all([
        glossaryApi.getAll().catch(err => {
          logger.error('Errore caricamento glossario:', err);
          return [] as GlossaryTerm[];
        }),
        translatorApi.getAll().catch(err => {
          logger.error('Errore caricamento traduttore:', err);
          return [] as TranslationResult[];
        }),
      ]);

      // Calcola statistiche
      const categories: Record<string, number> = {};
      glossaryData.forEach(term => {
        const category = term.category || 'Generale';
        categories[category] = (categories[category] || 0) + 1;
      });

      // Ultimi 5 termini (ordinati per data se disponibile)
      const recentGlossary = [...glossaryData]
        .sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5);

      // Ultime 5 traduzioni
      const recentTranslations = [...translatorData].slice(0, 5);

      setStats({
        glossaryTotal: glossaryData.length,
        translatorTotal: translatorData.length,
        glossaryCategories: categories,
        recentGlossaryTerms: recentGlossary,
        recentTranslations: recentTranslations,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const errorMessage = handleApiError(err);
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      logger.error('Errore caricamento statistiche:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleExportGlossary = () => {
    try {
      // Export JSON semplice
      const dataStr = JSON.stringify(stats.recentGlossaryTerms, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `glossario-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      logger.error('Errore export:', err);
    }
  };

  const topCategories = Object.entries(stats.glossaryCategories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard__header">
        <div className="admin-dashboard__header-left">
          <h1>
            <PersonIcon className="admin-dashboard__title-icon" />
            Dashboard Amministratore
          </h1>
          <button 
            onClick={loadStats} 
            className="admin-dashboard__refresh"
            disabled={isRefreshing}
            aria-label="Aggiorna statistiche"
          >
            <ReloadIcon className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Aggiornamento...' : 'Aggiorna'}
          </button>
        </div>
        <button onClick={handleLogout} className="admin-dashboard__logout">
          <ExitIcon />
          Logout
        </button>
      </div>

      <div className="admin-dashboard__content">
        {/* Statistiche */}
        <div className="admin-dashboard__stats">
          <div className="stat-card stat-card--primary">
            <div className="stat-card__icon">
              <FileTextIcon />
            </div>
            <div className="stat-card__content">
              <h3>Termini Glossario</h3>
              <p className="stat-card__value">
                {stats.isLoading ? '...' : stats.glossaryTotal}
              </p>
            </div>
          </div>

          <div className="stat-card stat-card--secondary">
            <div className="stat-card__icon">
              <ChatBubbleIcon />
            </div>
            <div className="stat-card__content">
              <h3>Traduzioni</h3>
              <p className="stat-card__value">
                {stats.isLoading ? '...' : stats.translatorTotal}
              </p>
            </div>
          </div>

          <div className="stat-card stat-card--accent">
            <div className="stat-card__icon">
              <CheckIcon />
            </div>
            <div className="stat-card__content">
              <h3>Categorie Attive</h3>
              <p className="stat-card__value">
                {stats.isLoading ? '...' : Object.keys(stats.glossaryCategories).length}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {stats.error && (
          <div className="admin-dashboard__error">
            <CrossCircledIcon />
            <span>{stats.error}</span>
            <button onClick={loadStats} className="admin-dashboard__retry">
              Riprova
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="admin-dashboard__quick-actions">
          <h2>Azioni Rapide</h2>
          <div className="quick-actions__grid">
            <Link to="/admin-dashboard/glossario" className="quick-action">
              <PlusIcon />
              <span>Aggiungi Termine</span>
            </Link>
            <Link to="/admin-dashboard/traduttore" className="quick-action">
              <PlusIcon />
              <span>Aggiungi Traduzione</span>
            </Link>
            <button 
              onClick={handleExportGlossary} 
              className="quick-action"
              disabled={stats.isLoading || stats.glossaryTotal === 0}
            >
              <DownloadIcon />
              <span>Export Glossario</span>
            </button>
          </div>
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <div className="admin-dashboard__categories">
            <h2>Categorie Più Usate</h2>
            <div className="categories__list">
              {topCategories.map(([category, count]) => (
                <div key={category} className="category-item">
                  <span className="category-item__name">{category}</span>
                  <span className="category-item__count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gestione Cards */}
        <div className="admin-dashboard__management">
          <h2>Gestione Contenuti</h2>
          <div className="admin-dashboard__cards">
            <Link to="/admin-dashboard/glossario" className="admin-card">
              <div className="admin-card__icon">
                <FileTextIcon />
              </div>
              <h3>Gestione Glossario</h3>
              <p>Aggiungi, modifica o elimina termini del glossario antifrode</p>
              {stats.glossaryTotal > 0 && (
                <div className="admin-card__badge">
                  {stats.glossaryTotal} {stats.glossaryTotal === 1 ? 'termine' : 'termini'}
                </div>
              )}
            </Link>

            <Link to="/admin-dashboard/traduttore" className="admin-card">
              <div className="admin-card__icon">
                <ChatBubbleIcon />
              </div>
              <h3>Gestione Traduttore</h3>
              <p>Gestisci le traduzioni tra linguaggio boomer e slang moderno</p>
              {stats.translatorTotal > 0 && (
                <div className="admin-card__badge">
                  {stats.translatorTotal} {stats.translatorTotal === 1 ? 'traduzione' : 'traduzioni'}
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        {(stats.recentGlossaryTerms.length > 0 || stats.recentTranslations.length > 0) && (
          <div className="admin-dashboard__recent">
            <h2>Attività Recente</h2>
            <div className="recent__grid">
              {stats.recentGlossaryTerms.length > 0 && (
                <div className="recent__section">
                  <h3>Ultimi Termini</h3>
                  <ul className="recent__list">
                    {stats.recentGlossaryTerms.map(term => (
                      <li key={term.id} className="recent__item">
                        <span className="recent__item-name">{term.term}</span>
                        <span className="recent__item-category">{term.category}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {stats.recentTranslations.length > 0 && (
                <div className="recent__section">
                  <h3>Ultime Traduzioni</h3>
                  <ul className="recent__list">
                    {stats.recentTranslations.map(translation => (
                      <li key={translation.id} className="recent__item">
                        <span className="recent__item-name">
                          {translation.boomerWord} → {translation.slangWord}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

