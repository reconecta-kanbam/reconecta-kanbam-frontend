// // src/api/services/auth.service.ts
// import api from '../api';
// import ENDPOINTS from '../endpoints';
// import { LoginRequest, RegisterRequest, AuthResponse, ErrorResponse } from '../types';

// export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
//   const response = await api.post<AuthResponse>(ENDPOINTS.AUTH_LOGIN, data);
//   localStorage.setItem('access_token', response.data.token);
//   return response.data;
// };

// export const createUser = async (data: RegisterRequest): Promise<AuthResponse> => {
//   const response = await api.post<AuthResponse>(ENDPOINTS.AUTH_CADASTRO, data);
//   localStorage.setItem('access_token', response.data.token);
//   return response.data;
// };

// export const recoverPassword = async (email: string): Promise<void> => {
//   await api.post(ENDPOINTS.AUTH_RECUPERAR_SENHA, { email });
// };

// export const logoutUser = () => {
//   localStorage.removeItem('access_token');
// };