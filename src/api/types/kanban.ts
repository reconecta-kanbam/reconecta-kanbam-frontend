// src/api/types/kanban.ts
import { Ocorrencia } from "./ocorrencia";

export interface Card {
  id: string;
  titulo: string;
  descricao?: string;
  colaboradorNome?: string;
  email?: string;
  ocorrencia?: Ocorrencia;
  createdAt: string;
  statusId: number;
  statusNome: string;
}

export interface Column {
  id: string;
  titulo: string;
  statusId: number;
  statusChave: string;
  ordem: number;
  workflowId?: number;
  cards: Card[];
}

export interface Status {
  id: number;
  chave: string;
  nome: string;
  ordem: number;
  workflowId?: number; 
}