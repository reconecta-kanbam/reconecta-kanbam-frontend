"use client";

import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { WorkflowConfigDialog } from "./dialogs/WorkflowConfigDialog";
import { TaskDetailDialog } from "./dialogs/TaskDetailDialog";
import { getKanbanData } from "../../api/services/kanban";
import { Column, Card } from "../../api/types/kanban";

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
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
      setDialogOpen(true);
    }
  };

  const handleSaveEdit = (newTitle: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === selectedCard?.id ? { ...card, titulo: newTitle } : card
        ),
      }))
    );
    setDialogOpen(false);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    // 🔹 Depois você chamará PATCH /ocorrencias/:id → para atualizar status
    console.log(`Mover ${source.droppableId} → ${destination.droppableId}`);
  };

  return (
    <>
      <div className="flex justify-between items-center px-6 pt-4">
        <h2 className="text-xl font-semibold text-gray-800">📋 Kanban Board</h2>
        <button
          onClick={() => setWorkflowDialogOpen(true)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Configurar Workflow
        </button>
      </div>

      {columns.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 p-6 bg-gray-50 min-h-screen overflow-x-auto">
            {columns.map((col) => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-white rounded-xl p-4 shadow-md w-72 flex-shrink-0"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {col.titulo}
                      </h3>
                      <button
                        onClick={() => setAddCardOpen(true)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        ＋ Adicionar
                      </button>
                    </div>

                    {col.cards.map((card, index) => (
                      <Draggable
                        key={card.id}
                        draggableId={card.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              handleEdit(col.id, card.id);
                              setDetailOpen(true);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 rounded-md p-3 mb-2 cursor-pointer transition"
                          >
                            <h4 className="font-semibold text-gray-800">
                              {card.titulo}
                            </h4>
                            {card.colaboradorNome && (
                              <p className="text-xs text-gray-500 mt-1">
                                Responsável: {card.colaboradorNome}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
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
      <WorkflowConfigDialog
        open={workflowDialogOpen}
        onOpenChange={setWorkflowDialogOpen}
        onSave={() => {}}
      />

      {selectedCard && (
        <TaskDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          title={selectedCard.titulo}
        />
      )}
    </>
  );
};

export default KanbanBoard;
