import { Ocorrencia } from "./ocorrencia";

export interface Card {
  id: string;
  titulo: string;
  descricao?: string;
  colaboradorNome?: string;
  ocorrencia?: Ocorrencia;
  createdAt: string;
  email: string;
  status: string;
}

export interface Column {
  id: string;
  titulo: string;
  cards: Card[];
}
