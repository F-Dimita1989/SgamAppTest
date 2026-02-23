import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { glossaryApi, type GlossaryTerm } from '../../apiServices/api';
import { sanitizeInput } from '../../utils/sanitize';
import { validateTerm, validateDefinition, validateCategory } from '../../utils/validation';
import { handleApiError } from '../../utils/errorHandler';
import { showConfirmation } from '../../utils/notifications';
import { logger } from '../../utils/logger';
import './AdminShared.css';

interface EditingTerm {
  id?: number;
  term: string;
  definition: string;
  category: string;
}
//provo da telefono
const AdminGlossario: React.FC = () => {
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTerm, setEditingTerm] = useState<EditingTerm>({
    term: '',
    definition: '',
    category: 'Generale'
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await glossaryApi.getAll();
      logger.dev('Glossario - Dati caricati:', data);
      logger.dev('Glossario - Primo elemento:', data[0]);
      setTerms(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsEditing(true);
    setEditingTerm({
      term: '',
      definition: '',
      category: 'Generale'
    });
  };

  const handleEdit = (term: GlossaryTerm) => {
    setIsEditing(true);
    setEditingTerm({
      id: term.id,
      term: term.term,
      definition: term.definition,
      category: term.category
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTerm({
      term: '',
      definition: '',
      category: 'Generale'
    });
  };

  const handleSave = async () => {
    // Sanitizza input
    const sanitizedTerm = sanitizeInput(editingTerm.term);
    const sanitizedDefinition = sanitizeInput(editingTerm.definition);
    const sanitizedCategory = sanitizeInput(editingTerm.category);

    // Valida input
    const termValidation = validateTerm(sanitizedTerm);
    const definitionValidation = validateDefinition(sanitizedDefinition);
    const categoryValidation = validateCategory(sanitizedCategory);

    if (!termValidation.valid) {
      setError(termValidation.error || 'Errore di validazione termine');
      return;
    }

    if (!definitionValidation.valid) {
      setError(definitionValidation.error || 'Errore di validazione definizione');
      return;
    }

    if (!categoryValidation.valid) {
      setError(categoryValidation.error || 'Errore di validazione categoria');
      return;
    }

    try {
      if (editingTerm.id) {
        // Update
        await glossaryApi.update(editingTerm.id, {
          term: sanitizedTerm,
          definition: sanitizedDefinition,
          category: sanitizedCategory
        });
        setSuccessMessage('Termine aggiornato con successo!');
      } else {
        // Add
        await glossaryApi.add({
          term: sanitizedTerm,
          definition: sanitizedDefinition,
          category: sanitizedCategory
        });
        setSuccessMessage('Termine aggiunto con successo!');
      }
      
      await loadTerms();
      handleCancel();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const handleDelete = async (id: number, term: string) => {
    const confirmed = await showConfirmation(`Sei sicuro di voler eliminare il termine "${term}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await glossaryApi.delete(id);
      setSuccessMessage('Termine eliminato con successo!');
      await loadTerms();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Errore nell\'eliminazione del termine');
      logger.error('Errore eliminazione termine:', err);
    }
  };

  return (
    <div className="admin-crud">
      <div className="admin-crud__header">
        <div>
          <Link to="/admin-dashboard" className="admin-crud__back">
            Torna alla Dashboard
          </Link>
          <h1>Gestione Glossario</h1>
        </div>
        {!isEditing && (
          <button onClick={handleAdd} className="admin-crud__add-btn">
            Aggiungi Termine
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
          <h2>{editingTerm.id ? 'Modifica Termine' : 'Nuovo Termine'}</h2>
          <div className="admin-crud__form">
            <div className="admin-crud__field">
              <label>Termine *</label>
              <input
                type="text"
                value={editingTerm.term}
                onChange={(e) => setEditingTerm({ ...editingTerm, term: e.target.value })}
                placeholder="Es: Phishing"
              />
            </div>
            <div className="admin-crud__field">
              <label>Definizione *</label>
              <textarea
                value={editingTerm.definition}
                onChange={(e) => setEditingTerm({ ...editingTerm, definition: e.target.value })}
                placeholder="Inserisci la definizione del termine"
                rows={4}
              />
            </div>
            <div className="admin-crud__field">
              <label>Categoria *</label>
              <input
                type="text"
                value={editingTerm.category}
                onChange={(e) => setEditingTerm({ ...editingTerm, category: e.target.value })}
                placeholder="Es: Sicurezza, Truffe Online, ecc."
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
                <th>Termine</th>
                <th>Definizione</th>
                <th>Categoria</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {terms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-crud__empty">
                    Nessun termine presente. Aggiungi il primo termine!
                  </td>
                </tr>
              ) : (
                terms.map((term) => (
                  <tr key={term.id}>
                    <td>{term.id}</td>
                    <td><strong>{term.term}</strong></td>
                    <td>{term.definition}</td>
                    <td><span className="admin-crud__category-badge">{term.category}</span></td>
                    <td>
                      <div className="admin-crud__actions">
                        <button
                          onClick={() => handleEdit(term)}
                          className="admin-crud__action-btn admin-crud__action-btn--edit"
                          title="Modifica"
                        >
                          Modifica
                        </button>
                        <button
                          onClick={() => handleDelete(term.id, term.term)}
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

export default AdminGlossario;

