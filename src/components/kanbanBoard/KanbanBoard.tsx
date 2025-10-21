"use client";

import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { EditCardDialog } from "./dialogs/EditCardDialog";
import { WorkflowConfigDialog } from "./dialogs/WorkflowConfigDialog";
import { AddCardDialog } from "./dialogs/AddCardDialog";

interface Card {
  id: string;
  title: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [selectedColId, setSelectedColId] = useState<string | null>(null);

  // Gera colunas a partir do workflow
  const generateColumnsFromWorkflow = (workflow: any): Column[] => {
    return workflow.states.map((state: any) => ({
      id: state.id,
      title: state.name,
      cards: [],
    }));
  };

  // Ao salvar o workflow, cria as colunas
  const handleWorkflowSave = (workflow: any) => {
    setWorkflowData(workflow);
    setColumns(generateColumnsFromWorkflow(workflow));
  };

  // Adiciona um novo card a uma coluna
  const handleAddCard = (colId: string) => {
    setSelectedColId(colId);
    setAddCardOpen(true);
  };

  const handleSaveNewCard = (title: string) => {
    if (!selectedColId) return;
    setColumns((prev) =>
      prev.map((col) =>
        col.id === selectedColId
          ? {
              ...col,
              cards: [
                ...col.cards,
                {
                  id: crypto.randomUUID(),
                  title: title.trim(),
                },
              ],
            }
          : col
      )
    );
    setAddCardOpen(false);
  };

  // Controla o movimento entre colunas
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColIndex = columns.findIndex(
      (c) => c.id === source.droppableId
    );
    const destColIndex = columns.findIndex(
      (c) => c.id === destination.droppableId
    );
    const sourceCol = columns[sourceColIndex];
    const destCol = columns[destColIndex];
    const movedCard = sourceCol.cards[source.index];

    // Verifica se a transição é permitida
    const transitionAllowed =
      workflowData?.transitions[sourceCol.id]?.includes(destCol.id) ?? false;

    if (!transitionAllowed && sourceCol.id !== destCol.id) {
      alert(
        `❌ Movimentação de "${sourceCol.title}" → "${destCol.title}" não é permitida!`
      );
      return;
    }

    // Move o card
    const newSourceCards = Array.from(sourceCol.cards);
    newSourceCards.splice(source.index, 1);

    const newDestCards = Array.from(destCol.cards);
    newDestCards.splice(destination.index, 0, movedCard);

    const newColumns = Array.from(columns);
    newColumns[sourceColIndex] = { ...sourceCol, cards: newSourceCards };
    newColumns[destColIndex] = { ...destCol, cards: newDestCards };
    setColumns(newColumns);
  };

  // Editar título de um card
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
          card.id === selectedCard?.id ? { ...card, title: newTitle } : card
        ),
      }))
    );
    setDialogOpen(false);
  };

  return (
    <>
      {/* Cabeçalho */}
      <div className="flex justify-between items-center px-6 pt-4">
        <h2 className="text-xl font-semibold text-gray-800">📋 Kanban Board</h2>
        <button
          onClick={() => setWorkflowDialogOpen(true)}
          className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Configurar Workflow
        </button>
      </div>

      {/* Board */}
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
                        {col.title}
                      </h3>
                      <button
                        onClick={() => handleAddCard(col.id)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        <span className="text-lg leading-none">＋</span>{" "}
                        Adicionar
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
                            onClick={() => handleEdit(col.id, card.id)}
                            className="bg-gray-100 hover:bg-gray-200 rounded-md p-3 mb-2 cursor-pointer transition"
                          >
                            {card.title}
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
          <p>Nenhum workflow configurado ainda.</p>
          <p className="text-sm mt-1">
            Clique em “Configurar Workflow” para começar.
          </p>
        </div>
      )}

      {/* Modais */}
      {selectedCard && (
        <EditCardDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialTitle={selectedCard.title}
          onSave={handleSaveEdit}
        />
      )}

      <WorkflowConfigDialog
        open={workflowDialogOpen}
        onOpenChange={setWorkflowDialogOpen}
        onSave={handleWorkflowSave}
      />

      <AddCardDialog
        open={addCardOpen}
        onOpenChange={setAddCardOpen}
        onSave={handleSaveNewCard}
      />
    </>
  );
};

export default KanbanBoard;
