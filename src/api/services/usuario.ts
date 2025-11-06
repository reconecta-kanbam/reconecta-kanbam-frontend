import api from "../api";
import ENDPOINTS from "../endpoints";
import { LoginRequest, RegisterRequest, AuthResponse } from "../types/usuario";

export interface Colaborador {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  setorId: number;
  peso: number;
}

export const loginUser = async (
  data: LoginRequest,
  rememberMe: boolean = true
): Promise<AuthResponse> => {
  const payload = {
    email: data.email,
    senha: data.password,
  };

  const response = await api.post<AuthResponse>(ENDPOINTS.AUTH_LOGIN, payload);

  const token =
    response.data.token ||
    response.data.access_token ||
    (response.data as any).accessToken ||
    response.data;

  if (!token || token === undefined) {
    console.error("Token não encontrado na resposta:", response.data);
    throw new Error("Token não retornado pela API");
  }

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

export const listUsers = async (): Promise<Colaborador[]> => {
  const response = await api.get(ENDPOINTS.LIST_USERS);
  return response.data;
};

export const listColaboradores = async (): Promise<Colaborador[]> => {
  const response = await api.get(ENDPOINTS.LIST_USERS);
  return response.data;
};

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