"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { getKanbanData } from "../../api/services/kanban";
import { Column, Card } from "../../api/types/kanban";
import { User, GripVertical, Eye } from "lucide-react";
import TaskDetailDialog from "./dialogs/TaskDetailDialog";

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    const loadKanban = async () => {
      try {
        setLoading(true);
        const data = await getKanbanData();
        setColumns(data);
      } catch (err) {
        console.error("Erro ao carregar Kanban:", err);
      } finally {
        setLoading(false);
      }
    };
    loadKanban();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    // 🔹 Depois você chamará PATCH /ocorrencias/:id → para atualizar status
    console.log(`Mover ${source.droppableId} → ${destination.droppableId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-red-50 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Kanban Board</h1>
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
                        ? "border-[#4c010c] bg-red-50"
                        : "border-gray-200"
                    }`}
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
        />
      )}
    </div>
  );
};

export default KanbanBoard;
