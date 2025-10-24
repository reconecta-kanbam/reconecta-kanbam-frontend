"use client";

import React, { useEffect, useState } from "react";
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

  // 🔹 Carrega os dados de ocorrências como cards
  useEffect(() => {
    const loadKanban = async () => {
      try {
        const data = await getKanbanData();
        setColumns(data);
      } catch (err) {
        console.error("Erro ao carregar Kanban:", err);
      }
    };
    loadKanban();
  }, []);

  const handleEdit = (colId: string, cardId: string) => {
    const col = columns.find((c) => c.id === colId);
    const card = col?.cards.find((card) => card.id === cardId);
    if (card) {
      setSelectedCard(card);
    }
  };

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
        {/* <p className="text-gray-600">
          Arraste e solte os cards para organizar suas tarefas
        </p> */}
      </div>

      {columns.length > 0 ? (
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
                        {col.titulo}
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
