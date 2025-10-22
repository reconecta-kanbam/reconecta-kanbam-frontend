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

// Interface atualizada para aceitar diferentes formatos de resposta
export interface AuthResponse {
  token?: string;
  access_token?: string;
  accessToken?: string;
  user?: {
    id: number;
    nome: string;
    email: string;
    perfil: UserRole;
    setorId: number;
  };
}