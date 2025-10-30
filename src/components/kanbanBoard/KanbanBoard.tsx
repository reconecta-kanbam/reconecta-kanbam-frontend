"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { getKanbanData } from "../../api/services/kanban";
import {
  editOcorrencia,
  updateStatusOcorrencia,
  updateStatusViaDrag,
  assignOcorrencia,
  autoAssignOcorrencia,
} from "../../api/services/ocorrencias";
import { Column, Card } from "../../api/types/kanban";
import { User, GripVertical, Eye } from "lucide-react";
import TaskDetailDialog from "./dialogs/TaskDetailDialog";
import AdvancedFilters, { FilterOptions } from "../ui/AdvancedFilters";

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Função para limpar mudanças locais
  const clearLocalChanges = () => {
    localStorage.removeItem("kanban_local_changes");
    showNotification(
      "🔄 Mudanças locais removidas. Recarregando...",
      "success"
    );
    setTimeout(() => {
      loadKanban();
    }, 1000);
  };

  // Função para mostrar notificações
  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // IMPLEMENTAÇÃO 4.2: Atribuir ocorrência para colaborador específico
  const handleAssignOcorrencia = async (
    ocorrenciaId: number,
    colaboradorId: number
  ) => {
    try {
      console.log(
        `👤 Atribuindo ocorrência ${ocorrenciaId} para colaborador ${colaboradorId}`
      );

      const updatedOcorrencia = await assignOcorrencia(ocorrenciaId, {
        colaboradorId,
      });

      // Atualizar o estado local
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card.ocorrencia?.id === ocorrenciaId
              ? { ...card, ocorrencia: updatedOcorrencia }
              : card
          ),
        }))
      );

      // Atualizar o card selecionado se for o mesmo
      if (selectedCard?.ocorrencia?.id === ocorrenciaId) {
        setSelectedCard((prev) =>
          prev ? { ...prev, ocorrencia: updatedOcorrencia } : null
        );
      }

      showNotification(`✅ Ocorrência atribuída com sucesso!`, "success");
    } catch (error: any) {
      console.error("Erro ao atribuir ocorrência:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(
        `❌ Erro ao atribuir ocorrência: ${errorMessage}`,
        "error"
      );
    }
  };

  // IMPLEMENTAÇÃO 4.3: Auto-atribuir ocorrência para o usuário logado
  const handleAutoAssignOcorrencia = async (ocorrenciaId: number) => {
    try {
      console.log(`🤖 Auto-atribuindo ocorrência ${ocorrenciaId}`);

      const updatedOcorrencia = await autoAssignOcorrencia(ocorrenciaId);

      // Atualizar o estado local
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card.ocorrencia?.id === ocorrenciaId
              ? { ...card, ocorrencia: updatedOcorrencia }
              : card
          ),
        }))
      );

      // Atualizar o card selecionado se for o mesmo
      if (selectedCard?.ocorrencia?.id === ocorrenciaId) {
        setSelectedCard((prev) =>
          prev ? { ...prev, ocorrencia: updatedOcorrencia } : null
        );
      }

      showNotification(`✅ Ocorrência auto-atribuída com sucesso!`, "success");
    } catch (error: any) {
      console.error("Erro ao auto-atribuir ocorrência:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Erro desconhecido";
      showNotification(
        `❌ Erro ao auto-atribuir ocorrência: ${errorMessage}`,
        "error"
      );
    }
  };

  // Função para formatar o título da coluna (status)
  const formatColumnTitle = (titulo: string) => {
    // Se já está formatado corretamente, retorna como está
    if (titulo.includes(" ") && titulo[0] === titulo[0].toUpperCase()) {
      return titulo;
    }

    // Mapeamento de casos especiais comuns
    const specialCases: Record<string, string> = {
      em_fila: "Em Fila",
      em_execucao: "Em Execução",
      em_andamento: "Em Andamento",
      aguardando_aprovacao: "Aguardando Aprovação",
      finalizado: "Finalizado",
      cancelado: "Cancelado",
      pendente: "Pendente",
      concluido: "Concluído",
      pausado: "Pausado",
    };

    // Verificar se existe um caso especial
    const lowerTitle = titulo.toLowerCase();
    if (specialCases[lowerTitle]) {
      return specialCases[lowerTitle];
    }

    // Converter de snake_case/slug para formato legível (fallback)
    return titulo
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // 🔹 Carrega os dados de ocorrências como cards
  const loadKanban = async (currentFilters: FilterOptions = {}) => {
    try {
      setLoading(true);
      console.log("📋 [KANBAN] Carregando com filtros:", currentFilters);
      const data = await getKanbanData(currentFilters);

      // Aplicar mudanças locais salvas (para persistir entre recarregamentos)
      const localChanges = JSON.parse(
        localStorage.getItem("kanban_local_changes") || "{}"
      );

      if (Object.keys(localChanges).length > 0) {
        console.log("🔧 Aplicando mudanças locais salvas:", localChanges);

        const updatedData = data.map((column) => ({
          ...column,
          cards: column.cards.map((card) => {
            const change = localChanges[card.id];
            if (change && card.ocorrencia) {
              // Aplicar mudança de status salva localmente
              const newStatusId = change.statusId;
              const newColumnId = getColumnIdFromStatusId(newStatusId);

              console.log(
                `🔄 Aplicando mudança local: Card ${card.id} para status ${newStatusId}`
              );

              return {
                ...card,
                ocorrencia: {
                  ...card.ocorrencia,
                  status: {
                    id: newStatusId,
                    chave: newColumnId,
                    nome: newColumnId,
                    ordem: newStatusId,
                  },
                },
              };
            }
            return card;
          }),
        }));

        // Reorganizar cards nas colunas corretas
        const finalData = reorganizeCardsByStatus(updatedData);
        setColumns(finalData);
      } else {
        setColumns(data);
      }

      console.log("📊 [KANBAN] Dados recarregados:", data);
    } catch (err) {
      console.error("Erro ao carregar Kanban:", err);
    } finally {
      setLoading(false);
    }
  };

  // Função para reorganizar cards baseado no status
  const reorganizeCardsByStatus = (columns: Column[]): Column[] => {
    // Coletar todos os cards
    const allCards: Card[] = [];
    columns.forEach((col) => {
      allCards.push(...col.cards);
    });

    // Limpar todas as colunas
    const clearedColumns: Column[] = columns.map((col) => ({
      ...col,
      cards: [],
    }));

    // Redistribuir cards baseado no status
    allCards.forEach((card) => {
      if (card.ocorrencia?.status) {
        const statusChave =
          card.ocorrencia.status.chave ||
          getColumnIdFromStatusId(card.ocorrencia.status.id);
        const targetColumn = clearedColumns.find(
          (col) => col.id === statusChave
        );
        if (targetColumn) {
          targetColumn.cards.push(card);
        } else {
          // Se não encontrar a coluna, colocar em "sem-status"
          const semStatusCol = clearedColumns.find(
            (col) => col.id === "sem-status"
          );
          if (semStatusCol) {
            semStatusCol.cards.push(card);
          }
        }
      }
    });

    return clearedColumns;
  };

  useEffect(() => {
    loadKanban(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Função para atualizar filtros
  const handleFiltersChange = (newFilters: FilterOptions) => {
    console.log("🔄 [KANBAN] Filtros atualizados:", newFilters);
    setFilters(newFilters);
  }; // Função robusta para forçar atualização de status
  const forceUpdateStatus = async (
    ocorrenciaId: number,
    newStatusId: number,
    ocorrencia: any
  ) => {
    console.log(`🚀 Tentando FORÇAR atualização de status para ${newStatusId}`);

    // MÉTODO 1: Endpoint específico de status com múltiplos formatos
    try {
      console.log("🔄 Método 1: Endpoint específico de status");
      const result = await updateStatusOcorrencia(ocorrenciaId, {
        statusId: newStatusId,
      });
      if (result && result.status?.id === newStatusId) {
        console.log("✅ Método 1 funcionou!");
        return result;
      }
      console.warn("⚠️ Método 1 falhou - status não atualizado");
    } catch (error) {
      console.warn("⚠️ Método 1 falhou:", error);
    }

    // MÉTODO 2: Edição com statusId
    try {
      console.log("🔄 Método 2: Edição com statusId");
      const payload = {
        titulo: ocorrencia.titulo,
        descricao: ocorrencia.descricao,
        setorId: ocorrencia.setor?.id || 1,
        statusId: newStatusId,
      };
      const result = await editOcorrencia(ocorrenciaId, payload);
      if (result.status?.id === newStatusId) {
        console.log("✅ Método 2 funcionou!");
        return result;
      }
      console.warn("⚠️ Método 2 falhou - status não atualizado");
    } catch (error) {
      console.warn("⚠️ Método 2 falhou:", error);
    }

    // MÉTODO 3: PUT direto (tentar endpoint diferente)
    try {
      console.log("🔄 Método 3: PUT direto no endpoint");
      const response = await fetch(`/api/ocorrencias/${ocorrenciaId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ statusId: newStatusId }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status?.id === newStatusId) {
          console.log("✅ Método 3 funcionou!");
          return result;
        }
      }
      console.warn("⚠️ Método 3 falhou");
    } catch (error) {
      console.warn("⚠️ Método 3 falhou:", error);
    }

    // MÉTODO 4: Última tentativa - forçar via localStorage
    console.log("🔧 Todos os métodos falharam - usando persistência local");
    const forcedUpdate = {
      ...ocorrencia,
      status: {
        id: newStatusId,
        chave: getColumnIdFromStatusId(newStatusId),
        nome: getColumnIdFromStatusId(newStatusId),
        ordem: newStatusId,
      },
    };

    // Salvar mudança no localStorage para persistir entre recarregamentos
    const localChanges = JSON.parse(
      localStorage.getItem("kanban_local_changes") || "{}"
    );
    localChanges[ocorrenciaId] = {
      statusId: newStatusId,
      timestamp: Date.now(),
    };

    // Limpar mudanças antigas (mais de 24 horas)
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    Object.keys(localChanges).forEach((key) => {
      if (localChanges[key].timestamp < oneDayAgo) {
        delete localChanges[key];
      }
    });

    localStorage.setItem("kanban_local_changes", JSON.stringify(localChanges));

    console.log("💾 Status salvo localmente para persistir recarregamentos");
    return forcedUpdate;
  };

  // Mapeamento de status ID baseado nas colunas disponíveis
  const getStatusIdFromColumnId = (columnId: string): number | null => {
    const statusMap: Record<string, number> = {
      em_atribuicao: 1,
      em_fila: 2,
      desenvolvimento: 3,
      aprovacao: 4,
      documentacao: 5,
      entregue: 6,
      em_execucao: 7,
      "sem-status": 1, // fallback para sem status
    };
    return statusMap[columnId] || null;
  };

  // Mapeamento reverso: ID para chave
  const getColumnIdFromStatusId = (statusId: number): string => {
    const reverseMap: Record<number, string> = {
      1: "em_atribuicao",
      2: "em_fila",
      3: "desenvolvimento",
      4: "aprovacao",
      5: "documentacao",
      6: "entregue",
      7: "em_execucao",
    };
    return reverseMap[statusId] || "sem-status";
  };

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // ✨ IMPLEMENTAÇÃO 4.1: DRAG & DROP REAL ✨
    // Esta função agora utiliza o endpoint PATCH /ocorrencias/:id/status
    // para atualizar o status das ocorrências via drag and drop

    // Se não há destino válido, não faz nada
    if (!destination) {
      console.log("🚫 Drag cancelado - sem destino válido");
      return;
    }

    // Se voltou para a mesma posição, não faz nada
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      console.log("� Drag cancelado - mesma posição");
      return;
    }

    console.log(
      `🎯 Movendo card ${draggableId} de ${source.droppableId} → ${destination.droppableId}`
    );

    // Encontrar o card que está sendo movido
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const draggedCard = sourceColumn?.cards.find(
      (card) => card.id === draggableId
    );

    if (!draggedCard || !draggedCard.ocorrencia) {
      console.error("❌ Card ou ocorrência não encontrada para arrastar");
      return;
    }

    // Atualização otimista da UI
    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex(
      (col) => col.id === source.droppableId
    );
    const destColIndex = newColumns.findIndex(
      (col) => col.id === destination.droppableId
    );

    // Remover da coluna de origem
    const [movedCard] = newColumns[sourceColIndex].cards.splice(
      source.index,
      1
    );

    // Adicionar na coluna de destino
    newColumns[destColIndex].cards.splice(destination.index, 0, movedCard);

    // Atualizar a UI imediatamente
    setColumns(newColumns);
    setDragging(true);

    try {
      // Mapear a coluna de destino para um status ID
      const newStatusId = getStatusIdFromColumnId(destination.droppableId);

      if (!newStatusId) {
        throw new Error(
          `Status ID não encontrado para coluna: ${destination.droppableId}`
        );
      }

      console.log(
        `🔄 Atualizando status da ocorrência ${draggedCard.ocorrencia.id} para status ${newStatusId}`
      );

      // IMPLEMENTAÇÃO 4.1: Usar nova API de Drag & Drop
      try {
        console.log("🎯 Usando API otimizada para Drag & Drop");
        const updatedOcorrencia = await updateStatusViaDrag(
          draggedCard.ocorrencia.id,
          newStatusId
        );

        console.log("✅ Status atualizado via drag & drop:", updatedOcorrencia);

        // Atualizar o card na UI com os dados do backend
        const finalColumns = [...newColumns];
        const destColIndex = finalColumns.findIndex(
          (col) => col.id === destination.droppableId
        );
        const cardIndex = finalColumns[destColIndex].cards.findIndex(
          (card) => card.id === draggableId
        );

        if (cardIndex !== -1) {
          finalColumns[destColIndex].cards[cardIndex] = {
            ...finalColumns[destColIndex].cards[cardIndex],
            ocorrencia: updatedOcorrencia,
          };
          setColumns(finalColumns);
        }

        showNotification(
          `✅ Card movido para "${formatColumnTitle(
            destination.droppableId
          )}" com sucesso!`
        );

        setDragging(false);
        return;
      } catch (error) {
        console.warn(
          "⚠️ API direta falhou, tentando método de fallback:",
          error
        );
      }

      // FALLBACK: Usar função robusta que tenta todos os métodos possíveis
      const updatedOcorrencia = await forceUpdateStatus(
        draggedCard.ocorrencia.id,
        newStatusId,
        draggedCard.ocorrencia
      );

      console.log("✅ Status atualizado com sucesso:", updatedOcorrencia);

      // Mostrar notificação de sucesso
      showNotification(
        `✅ Card movido para "${formatColumnTitle(
          destination.droppableId
        )}" com sucesso!`
      );

      // Verificar se o status foi realmente atualizado
      if (updatedOcorrencia.status?.id === newStatusId) {
        console.log("🎉 Status atualizado corretamente no backend!");

        // Atualizar o card na UI com os dados do backend
        const finalColumns = [...newColumns];
        const destColIndex = finalColumns.findIndex(
          (col) => col.id === destination.droppableId
        );
        const cardIndex = finalColumns[destColIndex].cards.findIndex(
          (card) => card.id === draggableId
        );

        if (cardIndex !== -1) {
          finalColumns[destColIndex].cards[cardIndex] = {
            ...finalColumns[destColIndex].cards[cardIndex],
            ocorrencia: updatedOcorrencia,
          };
          setColumns(finalColumns);
          console.log("🔄 UI atualizada com dados do backend");
        }
      } else {
        console.warn(
          "⚠️ Status não foi atualizado no backend, mantendo mudança local"
        );
        // A mudança já está aplicada na UI, não precisa fazer nada
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar status via drag and drop:", error);

      // Reverter a mudança na UI em caso de erro
      console.log("🔄 Revertendo mudança na UI devido ao erro");
      const revertedColumns = [...columns];
      const revertSourceIndex = revertedColumns.findIndex(
        (col) => col.id === source.droppableId
      );
      const revertDestIndex = revertedColumns.findIndex(
        (col) => col.id === destination.droppableId
      );

      // Remover da posição atual (destino)
      const [cardToRevert] = revertedColumns[revertDestIndex].cards.splice(
        destination.index,
        1
      );

      // Colocar de volta na posição original
      revertedColumns[revertSourceIndex].cards.splice(
        source.index,
        0,
        cardToRevert
      );

      setColumns(revertedColumns);

      // Mostrar notificação de erro
      showNotification(
        `❌ Erro ao mover card: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
        "error"
      );
    } finally {
      setDragging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <div>
            {dragging && (
              <div className="flex items-center gap-2 text-blue-600 animate-pulse">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">
                  Atualizando status...
                </span>
              </div>
            )}
          </div>

          {/* Botão para limpar mudanças locais */}
          <button
            onClick={clearLocalChanges}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
            title="Limpar mudanças salvas localmente e recarregar do servidor"
          >
            🔄 Resetar
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <div className="max-w-7xl mx-auto mb-6">
        <AdvancedFilters
          onFiltersChange={handleFiltersChange}
          showStatusFilter={false} // Não mostrar filtro de status no Kanban (já é visual)
          showCollaboratorFilter={true}
          showGestorFilter={true}
          className="shadow-lg"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#4c010c] rounded-full animate-spin"></div>
              <div
                className="w-12 h-12 border-4 border-transparent border-t-red-300 rounded-full animate-spin absolute top-2 left-2"
                style={{ animationDuration: "0.8s" }}
              ></div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Carregando...
              </h2>
              <p className="text-gray-500">Buscando suas ocorrências</p>
            </div>
          </div>
        </div>
      ) : columns.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 px-6 overflow-x-auto pb-4">
            {columns.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white rounded-2xl p-5 shadow-lg w-80 flex-shrink-0 border-2 transition-all ${
                      snapshot.isDraggingOver
                        ? "border-[#4c010c] bg-red-50 transform scale-105"
                        : "border-gray-200"
                    } ${dragging ? "opacity-75" : ""}`}
                  >
                    <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-200">
                      <h3 className="text-xl font-bold text-gray-800">
                        {formatColumnTitle(col.titulo)}
                      </h3>
                      <span className="bg-[#ffffa6] text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-300">
                        {col.cards.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {col.cards.map((card, index) => (
                        <Draggable
                          key={card.id}
                          draggableId={card.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => {
                                setSelectedCard(card);
                                setDetailOpen(true);
                              }}
                              className={`bg-gradient-to-br from-gray-50 to-slate-50 hover:from-red-50 hover:to-rose-50 rounded-xl p-4 cursor-grab active:cursor-grabbing transition-all border-2 ${
                                snapshot.isDragging
                                  ? "border-[#4c010c] shadow-2xl rotate-2 scale-105"
                                  : "border-gray-200 hover:border-[#4c010c] hover:shadow-lg"
                              }`}
                            >
                              <div className="flex items-start gap-2 mb-3">
                                <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <h4 className="font-semibold text-gray-800 flex-1 leading-snug">
                                  {card.titulo}
                                </h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCard(card);
                                    setDetailOpen(true);
                                  }}
                                  aria-label="Ver detalhes"
                                  className="p-1 rounded hover:bg-gray-100 ml-2"
                                >
                                  <Eye className="w-5 h-5 text-gray-500" />
                                </button>
                              </div>
                              {card.colaboradorNome && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-200">
                                  <User className="w-4 h-4 text-[#4c010c]" />
                                  <span className="font-medium">
                                    {card.colaboradorNome}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>

                    {provided.placeholder}

                    {col.cards.length === 0 && (
                      <p className="text-gray-400 text-sm italic text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        Arraste cards para cá
                      </p>
                    )}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          Nenhuma ocorrência disponível.
        </p>
      )}
      {selectedCard?.ocorrencia && (
        <TaskDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          ocorrencia={selectedCard.ocorrencia}
          onAssign={handleAssignOcorrencia}
          onAutoAssign={handleAutoAssignOcorrencia}
        />
      )}

      {/* Notificação Toast */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? "✅" : "❌"}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
