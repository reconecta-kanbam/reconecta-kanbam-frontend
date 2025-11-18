import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, recoverPassword } from '../../api/services/usuario';
import { getSectors } from '../../api/services/sectors';
import { Setor, UserRole } from '../../api/types/usuario';
import { useAuth } from '../../context/AuthContext';
import ErrorMessage from '../../ErrorMessage/services/ErrorMessageLogin';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, getErrorMessage, validateField } from '../../ErrorMessage/utils/errorMessageLogin';

const AuthPg: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, updateAuth } = useAuth();

  const [showLogin, setShowLogin] = useState(true);
  const [sectors, setSectors] = useState<Setor[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info' | 'success'>('error');
  const [sectorsError, setSectorsError] = useState('');
  
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
    setorId?: boolean;
    terms?: boolean;
  }>({});
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    role: 'COLABORADOR' as UserRole,
    setorId: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/workflows', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const loadSectors = async () => {
      setLoadingSectors(true);
      setSectorsError('');
      try {
        const data = await getSectors();
        setSectors(data);
      } catch (err: any) {
        console.error('Erro ao carregar setores:', err);
        setSectorsError(ERROR_MESSAGES.DATA.LOAD_SECTORS_FAILED);
      } finally {
        setLoadingSectors(false);
      }
    };
    loadSectors();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'setorId' ? parseInt(value, 10) || 0 : value
    }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [name]: false }));
  };

  const clearMessages = () => {
    setError('');
    setFieldErrors({});
  };

  const showError = (message: string) => {
    setError(message);
    setErrorType('error');
  };

  const showSuccess = (message: string) => {
    setError(message);
    setErrorType('success');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (formData.email === '' && formData.password === '') {
      showError('Preencha todos os campos.');
      setFieldErrors({
        email: true,
        password: true,
      });
      setLoading(false);
      return;
    }

    if (emailError || passwordError) {
      showError(emailError || passwordError || ERROR_MESSAGES.VALIDATION.FIELD_REQUIRED);
      setFieldErrors({
        email: !!emailError,
        password: !!passwordError,
      });
      setLoading(false);
      return;
    }

    try {
      await loginUser({
        email: formData.email,
        password: formData.password,
      }, rememberMe);

      updateAuth();
      showSuccess(SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS);
      
      setTimeout(() => {
        navigate('/workflows');
      }, 1000);
    } catch (err: any) {
      const message = err.response?.data?.message || ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
      showError(message);

      setFieldErrors({
        email: true,
        password: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmError = formData.password !== formData.confirmPassword ? ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH : null;
    const sectorError = validateField('setorId', formData.setorId);
    const termsError = !termsAgreed ? 'Você deve concordar com os termos de uso e política de privacidade.' : null;

    if (
      formData.name === '' &&
      formData.email === '' &&
      formData.password === '' &&
      formData.confirmPassword === '' &&
      formData.setorId === 0
    ) {
      showError('Preencha todos os campos.');
      setFieldErrors({
        name: true,
        email: true,
        password: true,
        confirmPassword: true,
        setorId: true,
        terms: false,
      });
      setLoading(false);
      return;
    }

    if (nameError || emailError || passwordError || confirmError || sectorError || termsError) {
      showError(nameError || emailError || passwordError || confirmError || sectorError || termsError || ERROR_MESSAGES.VALIDATION.FIELD_REQUIRED);
      setFieldErrors({
        name: !!nameError,
        email: !!emailError,
        password: !!passwordError,
        confirmPassword: !!confirmError,
        setorId: !!sectorError,
        terms: !!termsError,
      });
      setLoading(false);
      return;
    }

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        setorId: formData.setorId,
      });

      updateAuth();
      showSuccess(SUCCESS_MESSAGES.AUTH.REGISTRATION_SUCCESS);
      
      setTimeout(() => {
        setShowLogin(true);
        setFormData(prev => ({
          ...prev,
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          setorId: 0,
        }));
        setTermsAgreed(false);
      }, 2000);
    } catch (err: any) {
      const message = getErrorMessage(err) || ERROR_MESSAGES.AUTH.REGISTRATION_FAILED;
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    const emailError = validateField('email', formData.email);
    
    if (emailError) {
      showError(emailError);
      return;
    }

    setLoading(true);
    clearMessages();
    
    try {
      await recoverPassword(formData.email);
      showSuccess(SUCCESS_MESSAGES.AUTH.PASSWORD_RECOVERY_SENT);
    } catch (err: any) {
      const message = getErrorMessage(err) || ERROR_MESSAGES.AUTH.PASSWORD_RECOVERY_FAILED;
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <h1 className="brand-name">
              Reconecta <br /> kanban <span className="brand-dot">●</span>
            </h1>
            <p className="brand-tagline">Gerenciamento de Ocorrências e Projetos</p>
          </div>

          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bx bx-task"></i>
              </div>
              <div className="feature-text">
                <h3>Gestão de Ocorrências</h3>
                <p>Integração com Slack e criação manual de ocorrências</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <i className="bx bx-git-branch"></i>
              </div>
              <div className="feature-text">
                <h3>Fluxos Configuráveis</h3>
                <p>Workflows dinâmicos adaptados ao seu processo</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <i className="bx bx-group"></i>
              </div>
              <div className="feature-text">
                <h3>Gestão de Projetos</h3>
                <p>Projetos, tarefas e múltiplos responsáveis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-tabs">
          <button
            className={`auth-tab ${showLogin ? 'active' : ''}`}
            onClick={() => {
              setShowLogin(true);
              clearMessages();
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${!showLogin ? 'active' : ''}`}
            onClick={() => {
              setShowLogin(false);
              clearMessages();
            }}
            type="button"
          >
            Cadastro
          </button>
        </div>

        {error && (
          <ErrorMessage 
            message={error} 
            type={errorType}
            onClose={clearMessages}
          />
        )}

        {sectorsError && !showLogin && (
          <ErrorMessage 
            message={sectorsError} 
            type="error"
            onClose={() => setSectorsError('')}
          />
        )}

        {showLogin ? (
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2 className="form-title">Bem-vindo de volta!</h2>
              <p className="form-subtitle">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-envelope"></i> E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  className={fieldErrors.email ? 'form-input error' : 'form-input'}
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-lock-alt"></i> Senha
                </label>
                <input
                  type="password"
                  name="password"
                  className={fieldErrors.password ? 'form-input error' : 'form-input'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-options">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Lembrar de mim</span>
                </label>
                <button type="button" className="form-link" onClick={handleRecoverPassword} disabled={loading}>
                  Esqueceu a senha?
                </button>
              </div>

              <button type="submit" className="form-submit" disabled={loading}>
                <i className="bx bx-log-in"></i>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        ) : (
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2 className="form-title">Criar Nova Conta</h2>
              <p className="form-subtitle">Preencha os dados para começar a usar o sistema</p>
            </div>

            <form className="auth-form" onSubmit={handleSignupSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-user"></i> Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  className={fieldErrors.name ? 'form-input error' : 'form-input'}
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-envelope"></i> E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  className={fieldErrors.email ? 'form-input error' : 'form-input'}
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-lock-alt"></i> Senha
                </label>
                <input
                  type="password"
                  name="password"
                  className={fieldErrors.password ? 'form-input error' : 'form-input'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-lock-alt"></i> Confirmar Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className={fieldErrors.confirmPassword ? 'form-input error' : 'form-input'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-user-check"></i> Perfil
                </label>
                <select
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="COLABORADOR">Colaborador</option>
                  <option value="GESTOR">Gestor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-building"></i> Setor
                </label>
                <select
                  name="setorId"
                  className={fieldErrors.setorId ? 'form-input error' : 'form-input'}
                  value={formData.setorId}
                  onChange={handleInputChange}
                  disabled={loading || loadingSectors}
                >
                  <option value="0">
                    {loadingSectors ? 'Carregando setores...' : 'Selecione um setor'}
                  </option>
                  {sectors.map(sector => (
                    <option key={sector.id} value={sector.id}>
                      {sector.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className={fieldErrors.terms ? 'form-terms error' : 'form-terms'}>
                <label className="form-checkbox">
                  <input 
                    type="checkbox" 
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    disabled={loading} 
                  />
                  <span>
                    Eu concordo com os{' '}
                    <button
                      type="button"
                      className="form-link-inline"
                      onClick={() => alert('Termos de uso')}
                      disabled={loading}
                    >
                      Termos de uso
                    </button>{' '}
                    e{' '}
                    <button
                      type="button"
                      className="form-link-inline"
                      onClick={() => alert('Política de privacidade')}
                      disabled={loading}
                    >
                      Política de privacidade
                    </button>
                  </span>
                </label>
              </div>

              <button type="submit" className="form-submit" disabled={loading || loadingSectors}>
                <i className="bx bx-user-plus"></i>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </form>
          </div>
        )}

        <div className="auth-footer">
          <div className="footer-links">
            <button type="button" className="footer-link" onClick={() => alert('Termos de uso')}>
              Termos de uso
            </button>
            <span className="footer-separator">|</span>
            <button type="button" className="footer-link" onClick={() => alert('Política de privacidade')}>
              Política de privacidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPg;