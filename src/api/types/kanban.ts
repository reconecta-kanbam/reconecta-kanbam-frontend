import { Ocorrencia } from "./ocorrencia";

export interface Card {
  id: string;
  titulo: string;
  descricao?: string;
  colaboradorNome?: string;
  ocorrencia?: Ocorrencia;
}

export interface Column {
  id: string;
  titulo: string;
  cards: Card[];
}
