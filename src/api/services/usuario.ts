import api from '../api';
import ENDPOINTS from '../endpoints';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/usuario';

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  const payload = {
    email: data.email,
    senha: data.password,
  };
  const response = await api.post<AuthResponse>(ENDPOINTS.AUTH_LOGIN, payload);
  localStorage.setItem('access_token', response.data.token);
  return response.data;
};

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const payload = {
    nome: data.name,
    email: data.email,
    senha: data.password,
    perfil: data.role,
    setorId: data.setorId,
  };
  const response = await api.post<AuthResponse>(ENDPOINTS.AUTH_REGISTER, payload);
  localStorage.setItem('access_token', response.data.token);
  return response.data;
};

export const recoverPassword = async (email: string): Promise<void> => {
  await api.post(ENDPOINTS.AUTH_RECOVER_PASSWORD, { email });
};

export const logoutUser = () => {
  localStorage.removeItem('access_token');
  window.location.href = '/login';
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};