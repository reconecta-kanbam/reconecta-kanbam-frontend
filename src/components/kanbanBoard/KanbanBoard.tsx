import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { initialColumns, Column, Card } from "./kanbanData";
import { EditCardDialog } from "./EditCardDialog";

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

    const newSourceCards = Array.from(sourceCol.cards);
    newSourceCards.splice(source.index, 1);

    const newDestCards = Array.from(destCol.cards);
    newDestCards.splice(destination.index, 0, movedCard);

    const newColumns = Array.from(columns);
    newColumns[sourceColIndex] = { ...sourceCol, cards: newSourceCards };
    newColumns[destColIndex] = { ...destCol, cards: newDestCards };

    setColumns(newColumns);
  };

  const handleEdit = (colId: string, cardId: string) => {
    const col = columns.find((c) => c.id === colId);
    const card = col?.cards.find((card) => card.id === cardId);
    if (card) {
      setSelectedCard(card);
      setDialogOpen(true);
    }
  };

  const handleSave = (newTitle: string) => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        cards: col.cards.map((card) =>
          card.id === selectedCard?.id ? { ...card, title: newTitle } : card
        ),
      }))
    );
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
          {columns.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white rounded-xl p-4 shadow-md w-64"
                >
                  <h3 className="text-lg font-semibold mb-3">{col.title}</h3>
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

      {selectedCard && (
        <EditCardDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialTitle={selectedCard.title}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default KanbanBoard;
