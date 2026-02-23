import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { sanitizeInput } from '../../utils/sanitize';
import { validatePassword } from '../../utils/validation';
import { handleApiError } from '../../utils/errorHandler';
import { canMakeRequest, RateLimitConfigs, getTimeUntilReset } from '../../utils/rateLimiter';
import { EyeOpenIcon, EyeNoneIcon, LockClosedIcon, PersonIcon } from '@radix-ui/react-icons';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prevenzione doppi submit
    if (isLoading) {
      return;
    }

    setError('');

    // Rate limiting per prevenire brute force
    const rateLimitKey = 'admin-login';
    if (!canMakeRequest(rateLimitKey, RateLimitConfigs.login)) {
      const timeRemaining = Math.ceil(getTimeUntilReset(rateLimitKey) / 1000 / 60);
      setError(`Troppi tentativi. Riprova tra ${timeRemaining} minuti.`);
      return;
    }

    // Sanitizza input
    const sanitizedPassword = sanitizeInput(password);
    
    if (!sanitizedPassword.trim()) {
      setError('Inserisci la password');
      return;
    }

    // Validazione password
    const validation = validatePassword(sanitizedPassword);
    if (!validation.valid) {
      setError(validation.error || 'Password non valida');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    
    try {
      const success = await login(sanitizedPassword);
      
      // Delay uniforme per prevenire timing attack (minimo 500ms)
      const elapsed = Date.now() - startTime;
      const minDelay = 500;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      if (success) {
        navigate('/admin-dashboard');
      } else {
        // Messaggio generico per non rivelare informazioni
        setError('Credenziali non valide');
        setPassword('');
      }
    } catch (error) {
      // Delay anche in caso di errore
      const elapsed = Date.now() - startTime;
      const minDelay = 500;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      setError(handleApiError(error));
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <div className="admin-login__header">
          <div className="admin-login__icon">
            <PersonIcon />
          </div>
          <h1>Accesso Amministratore</h1>
          <p>Area riservata per la gestione dei contenuti</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login__form" autoComplete="off">
          {/* Campo nascosto per prevenire il salvataggio password del browser */}
          <input type="text" name="username" autoComplete="username" value="" readOnly style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} tabIndex={-1} />
          <input type="password" name="password" autoComplete="new-password" value="" readOnly style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} tabIndex={-1} />
          
          <div className="admin-login__field">
            <label htmlFor="admin-password">
              Password
            </label>
            <div className="admin-login__input-wrapper">
              <LockClosedIcon className="admin-login__lock-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="admin-password"
                name="admin-password-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="new-password"
                data-form-type="other"
                data-1p-ignore
                autoFocus
              />
              <button
                type="button"
                className="admin-login__toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
              >
                {showPassword ? <EyeNoneIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login__error" role="alert">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="admin-login__submit"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        <div className="admin-login__footer">
          <p>Questa è un'area riservata. Accesso solo per personale autorizzato.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

