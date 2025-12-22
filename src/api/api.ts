import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // ✅ Verificar se está correto
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ CORRIGIDO: Interceptor de erro NÃO deve fazer logout em erro de validação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Erro na API:", {
      status: error.response?.status,
      message: error.response?.data?.message,
    });

    // ✅ IMPORTANTE: Verificar se é erro 401 realmente de sessão expirada
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || "";

      // ✅ NUNCA deslogar em erro de validação (senha, credenciais, etc)
      const validationErrors = [
        "Senha",
        "incorreta",
        "credenciais",
        "credentials",
        "invalid",
        "inválido",
        "email",
      ];

      const isValidationError = validationErrors.some((keyword) =>
        message.toLowerCase().includes(keyword.toLowerCase())
      );

      if (isValidationError) {
        return Promise.reject(error);
      }

      // ✅ Apenas deslogar se for realmente sessão expirada
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // ✅ Propagar outros erros normalmente
    return Promise.reject(error);
  }
);

export default api;
