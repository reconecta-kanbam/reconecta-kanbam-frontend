// src/api/types/setor.ts

export interface Setor {
  id: number;
  nome: string;
}

export interface CreateSetorRequest {
  nome: string;
}

export interface UpdateSetorRequest {
  nome: string;
}