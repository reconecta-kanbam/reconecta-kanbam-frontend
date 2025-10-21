import React, { useState } from 'react';

const AuthPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email: formData.email, password: formData.password });
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Signup:', formData);
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-brand">
            <h1 className="brand-name">
              Reconecta <br/> kanban <span className="brand-dot">●</span>
            </h1>
            <p className="brand-tagline">
              Gerenciamento de Ocorrências e Projetos
            </p>
          </div>

          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">
                <i className='bx bx-task'></i>
              </div>
              <div className="feature-text">
                <h3>Gestão de Ocorrências</h3>
                <p>Integração com Slack e criação manual de ocorrências</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <i className='bx bx-git-branch'></i>
              </div>
              <div className="feature-text">
                <h3>Fluxos Configuráveis</h3>
                <p>Workflows dinâmicos adaptados ao seu processo</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <i className='bx bx-group'></i>
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
            onClick={() => setShowLogin(true)}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${!showLogin ? 'active' : ''}`}
            onClick={() => setShowLogin(false)}
            type="button"
          >
            Cadastro
          </button>
        </div>

        {showLogin ? (
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2 className="form-title">Bem-vindo de volta!</h2>
              <p className="form-subtitle">
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            <form className="auth-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <i className='bx bx-envelope'></i>
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className='bx bx-lock-alt'></i>
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-options">
                <label className="form-checkbox">
                  <input type="checkbox" />
                  <span>Lembrar de mim</span>
                </label>
                <button
                  type="button"
                  className="form-link"
                  onClick={() => alert('Recuperação de senha em breve')}
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button type="submit" className="form-submit">
                <i className='bx bx-log-in'></i>
                Entrar
              </button>
            </form>
          </div>
        ) : (
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2 className="form-title">Criar Nova Conta</h2>
              <p className="form-subtitle">
                Preencha os dados para começar a usar o sistema
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <i className='bx bx-user'></i>
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className='bx bx-envelope'></i>
                  E-mail
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className='bx bx-lock-alt'></i>
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className='bx bx-lock-alt'></i>
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-terms">
                <label className="form-checkbox">
                  <input type="checkbox" required />
                  <span>
                    Eu concordo com os{' '}
                    <button
                      type="button"
                      className="form-link-inline"
                      onClick={() => alert('Termos de uso')}
                    >
                      Termos de uso
                    </button>{' '}
                    e{' '}
                    <button
                      type="button"
                      className="form-link-inline"
                      onClick={() => alert('Política de privacidade')}
                    >
                      Política de privacidade
                    </button>
                  </span>
                </label>
              </div>

              <button type="submit" className="form-submit">
                <i className='bx bx-user-plus'></i>
                Criar Conta
              </button>
            </form>
          </div>
        )}

        <div className="auth-footer">
          <div className="footer-links">
            <button
              type="button"
              className="footer-link"
              onClick={() => alert('Termos de uso')}
            >
              Termos de uso
            </button>
            <span className="footer-separator">|</span>
            <button
              type="button"
              className="footer-link"
              onClick={() => alert('Política de privacidade')}
            >
              Política de privacidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;