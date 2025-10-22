import { listOcorrencias } from "./ocorrencias";
import { Column } from "../types/kanban";

export const getKanbanData = async (): Promise<Column[]> => {
  const ocorrencias = await listOcorrencias();

  const grouped = {
    backlog: ocorrencias.filter((o) => o.status === "Backlog"),
    emProgresso: ocorrencias.filter((o) => o.status === "Em andamento"),
    concluido: ocorrencias.filter((o) => o.status === "Concluído"),
  };

  return [
    {
      id: "backlog",
      titulo: "Backlog",
      cards: grouped.backlog.map((o) => ({ id: o.id, titulo: o.titulo })),
    },
    {
      id: "em-progresso",
      titulo: "Em Progresso",
      cards: grouped.emProgresso.map((o) => ({ id: o.id, titulo: o.titulo })),
    },
    {
      id: "concluido",
      titulo: "Concluído",
      cards: grouped.concluido.map((o) => ({ id: o.id, titulo: o.titulo })),
    },
  ];
};
