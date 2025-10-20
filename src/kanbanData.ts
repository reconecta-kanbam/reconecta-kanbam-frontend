export interface Card {
  id: string;
  title: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export const initialColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    cards: [
      { id: "1", title: "Criar estrutura do projeto" },
      { id: "2", title: "Definir cores do tema" },
    ],
  },
  {
    id: "in-progress",
    title: "Em Progresso",
    cards: [{ id: "3", title: "Implementar drag and drop" }],
  },
  {
    id: "done",
    title: "Concluído",
    cards: [],
  },
];
