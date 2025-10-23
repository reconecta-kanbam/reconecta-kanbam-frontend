export interface Card {
  id: string;
  titulo: string;
  descricao?: string;
  colaboradorNome?: string;
}

export interface Column {
  id: string;
  titulo: string;
  cards: Card[];
}
