// src/api/services/kanban.ts
import api from "../api";
import { Column, Card, Status } from "../types/kanban";
import { Ocorrencia } from "../types/ocorrencia";
import { listStatus } from "./status";

export interface KanbanFilters {
  titulo?: string;
  setorId?: number;
  colaboradorId?: number;
  statusId?: number;
  gestorId?: number;
  workflowId?: number;
}

/**
 * Busca status e ocorrências do backend e monta o Kanban dinamicamente.
 * As colunas são baseadas nos STATUS cadastrados (não workflows).
 */
export const getKanbanData = async (filters?: KanbanFilters): Promise<Column[]> => {
  try {
    console.log("📋 [KANBAN] Buscando status e ocorrências com filtros:", filters || {});

    // 1. Buscar todos os status (colunas do Kanban)
    const statusList = await listStatus();

    if (!statusList || statusList.length === 0) {
      console.warn("⚠️ Nenhum status encontrado no backend.");
      return [];
    }

    console.log(`✅ [KANBAN] ${statusList.length} status carregados:`, statusList);

    // 2. Buscar ocorrências com filtros
    const params: any = {};
    if (filters?.titulo) params.titulo = filters.titulo;
    if (filters?.setorId) params.setorId = filters.setorId;
    if (filters?.colaboradorId) params.colaboradorId = filters.colaboradorId;
    if (filters?.statusId) params.statusId = filters.statusId;
    if (filters?.gestorId) params.gestorId = filters.gestorId;
    if (filters?.workflowId) params.workflowId = filters.workflowId;

    const ocorrenciasResponse = await api.get<Ocorrencia[]>("/ocorrencias", { params });
    const ocorrencias = ocorrenciasResponse.data;

    console.log(`✅ [KANBAN] ${ocorrencias.length} ocorrências carregadas.`);

    // 3. Criar colunas baseadas nos status
    const columns: Column[] = statusList.map((status) => {
      // Filtrar ocorrências deste status
      const statusOcorrencias = ocorrencias.filter((occ) => {
        if (!occ.status) return false;
        return occ.status.id === status.id;
      });

      // Converter ocorrências para cards
      const cards: Card[] = statusOcorrencias.map((occ) => ({
        id: String(occ.id),
        titulo: occ.titulo,
        descricao: occ.descricao,
        colaboradorNome: occ.colaborador?.nome || "Não atribuído",
        email: occ.colaborador?.email || "",
        ocorrencia: occ,
        createdAt: occ.createdAt,
        statusId: status.id,
        statusNome: status.nome,
      }));

      return {
        id: status.chave,
        titulo: status.nome,
        statusId: status.id,
        statusChave: status.chave,
        ordem: status.ordem,
        cards,
      };
    });

    // 4. Verificar ocorrências sem status definido
    const mappedOcorrenciaIds = new Set(
      columns.flatMap((col) => col.cards.map((card) => card.id))
    );

    const unmappedOcorrencias = ocorrencias.filter(
      (occ) => !mappedOcorrenciaIds.has(String(occ.id))
    );

    // 5. Se houver ocorrências sem status, criar coluna especial
    if (unmappedOcorrencias.length > 0) {
      console.warn(
        `⚠️ [KANBAN] ${unmappedOcorrencias.length} ocorrências sem status definido.`
      );

      const unmappedCards: Card[] = unmappedOcorrencias.map((occ) => ({
        id: String(occ.id),
        titulo: occ.titulo,
        descricao: occ.descricao,
        colaboradorNome: occ.colaborador?.nome || "Não atribuído",
        email: occ.colaborador?.email || "",
        ocorrencia: occ,
        createdAt: occ.createdAt,
        statusId: 0,
        statusNome: "Sem Status",
      }));

      columns.push({
        id: "sem_status",
        titulo: "Sem Status",
        statusId: 0,
        statusChave: "sem_status",
        ordem: 999,
        cards: unmappedCards,
      });
    }

    // Ordenar colunas por ordem
    const sortedColumns = columns.sort((a, b) => a.ordem - b.ordem);

    console.log("📊 [KANBAN] Colunas geradas:", sortedColumns);
    return sortedColumns;
  } catch (error) {
    console.error("❌ [KANBAN] Erro ao buscar dados:", error);
    throw error;
  }
};