import { listOcorrencias } from "./ocorrencias";
import { Column, Card } from "../types/kanban";
import { Ocorrencia } from "../types/ocorrencia";

/**
 * Busca ocorrências do backend e agrupa por status para montar o Kanban dinamicamente.
 */
export const getKanbanData = async (filters?: {
  titulo?: string;
  setorId?: number;
}): Promise<Column[]> => {
  console.log("📋 [KANBAN] Buscando ocorrências com filtros:", filters || {});
  const ocorrencias = await listOcorrencias(filters);

  if (!ocorrencias || ocorrencias.length === 0) {
    console.log("⚠️ Nenhuma ocorrência encontrada no backend.");
    return [];
  }

  console.log(`✅ [KANBAN] ${ocorrencias.length} ocorrências carregadas.`);

  // 🔹 Agrupar por status dinamicamente
  const grouped: Record<string, Ocorrencia[]> = {};

  ocorrencias.forEach((o) => {
    const status = o.status?.nome || "Sem status";
    if (!grouped[status]) grouped[status] = [];
    grouped[status].push(o);
  });

  // 🔹 Gerar colunas compatíveis com o tipo Column e Card
  const columns: Column[] = Object.entries(grouped).map(([status, group]) => ({
    id: status.toLowerCase().replace(/\s+/g, "-"),
    titulo: status,
    cards: group.map(
      (o): Card => ({
        id: String(o.id),
        titulo: o.titulo,
        descricao: o.descricao,
        colaboradorNome: o.colaborador?.nome || "Não atribuído",
        ocorrencia: o,
      })
    ),
  }));

  console.log("📊 [KANBAN] Colunas geradas:", columns);
  return columns;
};
