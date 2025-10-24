import { useState } from 'react';

// Configuração centralizada de mensagens de erro

export const ERROR_MESSAGES = {
  // Erros de Autenticação
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciais inválidas. Verifique e-mail e senha.',
    LOGIN_FAILED: 'Erro ao realizar login. Tente novamente.',
    REGISTRATION_FAILED: 'Erro ao criar conta. Tente novamente.',
    PASSWORD_RECOVERY_FAILED: 'Erro ao recuperar senha.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.',
    SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
  },

  // Erros de Validação
  VALIDATION: {
    EMAIL_REQUIRED: 'Por favor, insira seu e-mail',
    EMAIL_INVALID: 'Por favor, insira um e-mail válido',
    PASSWORD_REQUIRED: 'Por favor, insira sua senha',
    PASSWORD_TOO_SHORT: 'A senha deve ter pelo menos 6 caracteres',
    PASSWORD_MISMATCH: 'As senhas não coincidem',
    NAME_REQUIRED: 'Por favor, insira seu nome',
    SECTOR_REQUIRED: 'Por favor, selecione um setor',
    FIELD_REQUIRED: 'Este campo é obrigatório',
  },

  // Erros de Rede
  NETWORK: {
    CONNECTION_ERROR: 'Erro de conexão. Verifique sua internet.',
    TIMEOUT: 'A requisição excedeu o tempo limite.',
    SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  },

  // Erros de Dados
  DATA: {
    LOAD_SECTORS_FAILED: 'Erro ao carregar setores. Tente recarregar a página.',
    LOAD_DATA_FAILED: 'Erro ao carregar dados.',
    SAVE_FAILED: 'Erro ao salvar dados.',
    DELETE_FAILED: 'Erro ao excluir dados.',
  },

  // Mensagens Genéricas
  GENERIC: {
    UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
    TRY_AGAIN: 'Algo deu errado. Por favor, tente novamente.',
  }
};

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Login realizado com sucesso!',
    REGISTRATION_SUCCESS: 'Cadastro realizado com sucesso! Faça login.',
    PASSWORD_RECOVERY_SENT: 'Instruções de recuperação enviadas para seu e-mail!',
    LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
  },
  DATA: {
    SAVE_SUCCESS: 'Dados salvos com sucesso!',
    DELETE_SUCCESS: 'Dados excluídos com sucesso!',
    UPDATE_SUCCESS: 'Dados atualizados com sucesso!',
  }
};

export const INFO_MESSAGES = {
  LOADING: 'Carregando...',
  PROCESSING: 'Processando...',
  SAVING: 'Salvando...',
};

// Função auxiliar para obter mensagem de erro a partir de um erro do Axios
export const getErrorMessage = (error: any): string => {
  // Se tem mensagem do servidor
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Se é erro de rede
  if (error.message === 'Network Error') {
    return ERROR_MESSAGES.NETWORK.CONNECTION_ERROR;
  }

  // Se é timeout
  if (error.code === 'ECONNABORTED') {
    return ERROR_MESSAGES.NETWORK.TIMEOUT;
  }

  // Por código de status
  const status = error.response?.status;
  switch (status) {
    case 401:
      return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.AUTH.UNAUTHORIZED;
    case 404:
      return 'Recurso não encontrado.';
    case 500:
      return ERROR_MESSAGES.NETWORK.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.GENERIC.UNKNOWN_ERROR;
  }
};

// Função para validar campos do formulário
export const validateField = (fieldName: string, value: any): string | null => {
  switch (fieldName) {
    case 'email':
      if (!value) return ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return ERROR_MESSAGES.VALIDATION.EMAIL_INVALID;
      }
      return null;

    case 'password':
      if (!value) return ERROR_MESSAGES.VALIDATION.PASSWORD_REQUIRED;
      if (value.length < 6) return ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT;
      return null;

    case 'name':
      if (!value || value.trim() === '') return ERROR_MESSAGES.VALIDATION.NAME_REQUIRED;
      return null;

    case 'setorId':
      if (!value || value === 0) return ERROR_MESSAGES.VALIDATION.SECTOR_REQUIRED;
      return null;

    default:
      return null;
  }
};

// Hook personalizado para gerenciar mensagens de erro
export const useErrorHandler = () => {
  const [error, setError] = useState<string>('');
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info' | 'success'>('error');

  const handleError = (err: any, customMessage?: string) => {
    const message = customMessage || getErrorMessage(err);
    setError(message);
    setErrorType('error');
  };

  const showSuccess = (message: string) => {
    setError(message);
    setErrorType('success');
  };

  const showWarning = (message: string) => {
    setError(message);
    setErrorType('warning');
  };

  const showInfo = (message: string) => {
    setError(message);
    setErrorType('info');
  };

  const clearError = () => {
    setError('');
  };

  return {
    error,
    errorType,
    handleError,
    showSuccess,
    showWarning,
    showInfo,
    clearError
  };
};