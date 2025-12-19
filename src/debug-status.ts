// ⚠️ ARQUIVO DE DEBUG - REMOVA APÓS TESTAR

import api from './api/api';

export const debugStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro:', error.response?.status, error.response?.data || error.message);
    throw error;
  }
};

// Chame no console do navegador:
// import { debugStatus } from './debug-status'; debugStatus();
