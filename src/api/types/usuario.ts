// src/types/usuario.ts
export type UserRole = 'ADMIN' | 'GESTOR' | 'COLABORADOR';

export interface Setor {
  id: number;
  nome: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  setorId: number;
}

export interface AuthResponse {
  token: string;
  user?: any;
}