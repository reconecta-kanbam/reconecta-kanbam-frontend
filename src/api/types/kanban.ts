export interface Card {
  id: string;
  titulo: string;
}

export interface Column {
  id: string;
  titulo: string;
  cards: Card[];
}
