import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { translatorApi, type TranslationResult } from '../../apiServices/api';
import { sanitizeInput } from '../../utils/sanitize';
import { validateWord, validateDescription } from '../../utils/validation';
import { handleApiError } from '../../utils/errorHandler';
import { showConfirmation } from '../../utils/notifications';
import { logger } from '../../utils/logger';
import './AdminShared.css';

interface EditingTranslation {
  id?: number;
  boomerWord: string;
  slangWord: string;
  description?: string;
}

const AdminTraduttore: React.FC = () => {
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<EditingTranslation>({
    boomerWord: '',
    slangWord: '',
    description: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadTranslations();
  }, []);

  const loadTranslations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await translatorApi.getAll();
      setTranslations(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingTranslation({
      boomerWord: '',
      slangWord: '',
      description: ''
    });
  };

  const handleEdit = (translation: TranslationResult) => {
    setIsEditing(true);
    setEditingTranslation({
      id: translation.id,
      boomerWord: translation.boomerWord,
      slangWord: translation.slangWord,
      description: translation.description || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTranslation({
      boomerWord: '',
      slangWord: '',
      description: ''
    });
  };

  const handleSave = async () => {
    // Sanitizza input
    const sanitizedBoomerWord = sanitizeInput(editingTranslation.boomerWord);
    const sanitizedSlangWord = sanitizeInput(editingTranslation.slangWord);
    const sanitizedDescription = editingTranslation.description 
      ? sanitizeInput(editingTranslation.description) 
      : '';

    // Valida input
    const boomerValidation = validateWord(sanitizedBoomerWord, 'Parola Boomer');
    const slangValidation = validateWord(sanitizedSlangWord, 'Parola Slang');
    const descriptionValidation = validateDescription(sanitizedDescription);

    if (!boomerValidation.valid) {
      setError(boomerValidation.error || 'Errore di validazione parola boomer');
      return;
    }

    if (!slangValidation.valid) {
      setError(slangValidation.error || 'Errore di validazione parola slang');
      return;
    }

    if (!descriptionValidation.valid) {
      setError(descriptionValidation.error || 'Errore di validazione descrizione');
      return;
    }

    try {
      if (editingTranslation.id) {
        // Update
        await translatorApi.update(editingTranslation.id, {
          boomerWord: sanitizedBoomerWord,
          slangWord: sanitizedSlangWord,
          description: sanitizedDescription || undefined
        });
        setSuccessMessage('Traduzione aggiornata con successo!');
      } else {
        // Add
        await translatorApi.add({
          boomerWord: sanitizedBoomerWord,
          slangWord: sanitizedSlangWord,
          description: sanitizedDescription || undefined
        });
        setSuccessMessage('Traduzione aggiunta con successo!');
      }
      
      await loadTranslations();
      handleCancel();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleDelete = async (id: number | undefined, boomerWord: string) => {
    if (!id) return;
    
    const confirmed = await showConfirmation(`Sei sicuro di voler eliminare la traduzione "${boomerWord}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await translatorApi.delete(id);
      setSuccessMessage('Traduzione eliminata con successo!');
      await loadTranslations();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Errore nell\'eliminazione della traduzione');
      logger.error('Errore eliminazione traduzione:', err);
    }
  };

  return (
    <div className="admin-crud">
      <div className="admin-crud__header">
        <div>
          <Link to="/admin-dashboard" className="admin-crud__back">
            Torna alla Dashboard
          </Link>
          <h1>Gestione Traduttore Generazionale</h1>
        </div>
        {!isEditing && (
          <button onClick={handleAdd} className="admin-crud__add-btn">
            Aggiungi Traduzione
          </button>
        )}
      </div>

      {successMessage && (
        <div className="admin-crud__success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="admin-crud__error">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="admin-crud__form-card">
          <h2>{editingTranslation.id ? 'Modifica Traduzione' : 'Nuova Traduzione'}</h2>
          <div className="admin-crud__form">
            <div className="admin-crud__field">
              <label>Parola Boomer *</label>
              <input
                type="text"
                value={editingTranslation.boomerWord}
                onChange={(e) => setEditingTranslation({ ...editingTranslation, boomerWord: e.target.value })}
                placeholder="Es: Telefono"
              />
            </div>
            <div className="admin-crud__field">
              <label>Parola Slang *</label>
              <input
                type="text"
                value={editingTranslation.slangWord}
                onChange={(e) => setEditingTranslation({ ...editingTranslation, slangWord: e.target.value })}
                placeholder="Es: Cell"
              />
            </div>
            <div className="admin-crud__field">
              <label>Descrizione/Spiegazione</label>
              <textarea
                value={editingTranslation.description || ''}
                onChange={(e) => setEditingTranslation({ ...editingTranslation, description: e.target.value })}
                placeholder="Aggiungi una descrizione o spiegazione della traduzione (opzionale)"
                rows={3}
              />
            </div>
            <div className="admin-crud__form-actions">
              <button onClick={handleSave} className="admin-crud__btn admin-crud__btn--save">
                Salva
              </button>
              <button onClick={handleCancel} className="admin-crud__btn admin-crud__btn--cancel">
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="admin-crud__loading">Caricamento...</div>
      ) : (
        <div className="admin-crud__table-container">
          <table className="admin-crud__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Parola Boomer</th>
                <th>Parola Slang</th>
                <th>Descrizione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {translations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-crud__empty">
                    Nessuna traduzione presente. Aggiungi la prima traduzione!
                  </td>
                </tr>
              ) : (
                translations.map((translation) => (
                  <tr key={translation.id}>
                    <td>{translation.id}</td>
                    <td><strong>{translation.boomerWord}</strong></td>
                    <td><strong>{translation.slangWord}</strong></td>
                    <td>{translation.description || <em style={{ color: '#999' }}>Nessuna descrizione</em>}</td>
                    <td>
                      <div className="admin-crud__actions">
                        <button
                          onClick={() => handleEdit(translation)}
                          className="admin-crud__action-btn admin-crud__action-btn--edit"
                          title="Modifica"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDelete(translation.id, translation.boomerWord)}
                          className="admin-crud__action-btn admin-crud__action-btn--delete"
                          title="Elimina"
                        >
                          Elimina
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTraduttore;

