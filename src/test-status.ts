// ⚠️ ARQUIVO DE DEBUG - REMOVA APÓS TESTAR

export const testStatusLoading = async () => {
  try {
    
    // Teste 1: Fetch direto
    const res1 = await fetch('http://localhost:3001/status');
    const data1 = await res1.json();
    
    // Teste 2: Via API service
    const { listStatus } = await import('./api/services/status');
    const data2 = await listStatus();
    
    return data2;
  } catch (error: any) {
    console.error('❌ Erro:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Chame no console:
// import { testStatusLoading } from './test-status'; testStatusLoading();
