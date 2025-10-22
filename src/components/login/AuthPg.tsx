import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, recoverPassword } from '../../api/services/usuario';
import { getSectors } from '../../api/services/sectors';
import { Setor, UserRole } from '../../api/types/usuario';
import { useAuth } from '../../context/AuthContext';

const AuthPg: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, updateAuth } = useAuth(); // Adicione updateAuth

  const [showLogin, setShowLogin] = useState(true);
  const [sectors, setSectors] = useState<Setor[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(true);
  const [sectorsError, setSectorsError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: boolean; password?: boolean }>({});
  const [rememberMe, setRememberMe] = useState(true);

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
      navigate('/kanbanBoard', { replace: true });
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
        setSectorsError('Erro ao carregar setores. Tente recarregar a página.');
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      await loginUser({
        email: formData.email,
        password: formData.password,
      }, rememberMe);

      updateAuth(); // Atualiza o estado de autenticação imediatamente

      alert('Login realizado com sucesso!');
      navigate('/kanbanBoard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Credenciais inválidas. Verifique e-mail e senha.';
      setError(message);
      alert(message);

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
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.setorId === 0) {
      setError('Por favor, selecione um setor');
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

      updateAuth(); // Atualiza após registro, caso logue automaticamente

      alert('Cadastro realizado com sucesso! Faça login.');
      setShowLogin(true);
      setFormData(prev => ({
        ...prev,
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        setorId: 0,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      setError(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    if (!formData.email) {
      setError('Por favor, insira seu e-mail');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await recoverPassword(formData.email);
      alert('Instruções de recuperação enviadas para seu e-mail!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erro ao recuperar senha.';
      setError(message);
      alert(message);
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
              setError('');
              setFieldErrors({});
            }}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${!showLogin ? 'active' : ''}`}
            onClick={() => {
              setShowLogin(false);
              setError('');
            }}
            type="button"
          >
            Cadastro
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              margin: '16px 0',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {sectorsError && !showLogin && (
          <div
            style={{
              padding: '12px',
              margin: '16px 0',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              fontSize: '14px',
            }}
          >
            {sectorsError}
          </div>
        )}

        {showLogin ? (
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2 className="form-title">Bem-vindo de volta!</h2>
              <p className="form-subtitle">Entre com suas credenciais para acessar o sistema</p>
            </div>

            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-envelope"></i> E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{
                    borderColor: fieldErrors.email ? '#ef4444' : '',
                    boxShadow: fieldErrors.email ? '0 0 0 1px #ef4444' : '',
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-lock-alt"></i> Senha
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  style={{
                    borderColor: fieldErrors.password ? '#ef4444' : '',
                    boxShadow: fieldErrors.password ? '0 0 0 1px #ef4444' : '',
                  }}
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

            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <i className="bx bx-user"></i> Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
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
                  className="form-input"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
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
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
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
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
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
                  required
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
                  className="form-input"
                  value={formData.setorId}
                  onChange={handleInputChange}
                  required
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

              <div className="form-terms">
                <label className="form-checkbox">
                  <input type="checkbox" required disabled={loading} />
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