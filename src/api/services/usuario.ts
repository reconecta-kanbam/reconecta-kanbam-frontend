import api from "../api";
import ENDPOINTS from "../endpoints";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/usuario";

export const loginUser = async (
  data: LoginRequest,
  rememberMe: boolean = true
): Promise<AuthResponse> => {
  const payload = {
    email: data.email,
    senha: data.password,
  };

  const response = await api.post<AuthResponse>(ENDPOINTS.AUTH_LOGIN, payload);

  // Tenta extrair o token de diferentes possíveis estruturas
  const token =
    response.data.token ||
    response.data.access_token ||
    (response.data as any).accessToken ||
    response.data;

  if (!token || token === undefined) {
    console.error("Token não encontrado na resposta:", response.data);
    throw new Error("Token não retornado pela API");
  }

  console.log("Token extraído:", token);

  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("access_token", token);

  return response.data;
};

export const registerUser = async (
  data: RegisterRequest
): Promise<AuthResponse> => {
  const payload = {
    nome: data.name,
    email: data.email,
    senha: data.password,
    perfil: data.role,
    setorId: data.setorId,
  };

  const response = await api.post<AuthResponse>(
    ENDPOINTS.AUTH_REGISTER,
    payload
  );

  // Debug: veja o que a API está retornando
  console.log("Resposta completa do registro:", response.data);

  // Tenta extrair o token de diferentes possíveis estruturas
  const token =
    response.data.token ||
    response.data.access_token ||
    (response.data as any).accessToken ||
    response.data;

  if (token && token !== undefined) {
    localStorage.setItem("access_token", token);
  }

  return response.data;
};

export const recoverPassword = async (email: string): Promise<void> => {
  const response = await api.post(ENDPOINTS.AUTH_RECOVER_PASSWORD, { email });
  return response.data;
};

// Lista todos os usuários
export const listUsers = async () => {
  const response = await api.get(ENDPOINTS.LIST_USERS);
  return response.data;
};

// Lista todos os status
export const listStatus = async () => {
  const response = await api.get(ENDPOINTS.LIST_STATUS);
  return response.data;
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  sessionStorage.removeItem("access_token");
  window.location.href = "/login";
};

export const isAuthenticated = (): boolean => {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");
  return !!token && token !== "undefined" && token !== "null";
};
