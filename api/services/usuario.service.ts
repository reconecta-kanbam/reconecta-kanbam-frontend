// // src/api/services/usuario.service.ts
// import api from '../api';
// import ENDPOINTS from '../endpoints';
// import { User } from '../types';

// export interface CreateUserRequest {
//   email: string;
//   name: string;
//   password: string;
//   role?: string;
// }

// export const getUsers = async (): Promise<User[]> => {
//   const response = await api.get<User[]>(ENDPOINTS.USUARIO_LISTAR);
//   return response.data;
// };

// export const getUserById = async (id: string): Promise<User> => {
//   const response = await api.get<User>(`${ENDPOINTS.USUARIO_DETALHES}${id}`);
//   return response.data;
// };

// export const createUsuario = async (data: CreateUserRequest): Promise<User> => {
//   const response = await api.post<User>(ENDPOINTS.USUARIO_CRIAR, data);
//   return response.data;
// };

// export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
//   const response = await api.patch<User>(`${ENDPOINTS.USUARIO_ATUALIZAR}${id}`, data);
//   return response.data;
// };

// export const deleteUser = async (id: string): Promise<void> => {
//   await api.delete(`${ENDPOINTS.USUARIO_EXCLUIR}${id}`);
// };