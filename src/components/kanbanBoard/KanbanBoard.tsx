import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { initialColumns, Column, Card } from "./kanbanData";

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

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

    // Remover do source
    const newSourceCards = Array.from(sourceCol.cards);
    newSourceCards.splice(source.index, 1);

    // Adicionar no destino
    const newDestCards = Array.from(destCol.cards);
    newDestCards.splice(destination.index, 0, movedCard);

    const newColumns = Array.from(columns);
    newColumns[sourceColIndex] = { ...sourceCol, cards: newSourceCards };
    newColumns[destColIndex] = { ...destCol, cards: newDestCards };

    setColumns(newColumns);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", gap: "20px" }}>
        {columns.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  background: "#f4f4f4",
                  padding: "10px",
                  width: "250px",
                  borderRadius: "5px",
                  minHeight: "200px",
                }}
              >
                <h3>{col.title}</h3>
                {col.cards.map((card: Card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          padding: "10px",
                          margin: "5px 0",
                          background: "white",
                          borderRadius: "3px",
                          ...provided.draggableProps.style,
                        }}
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
  );
};

export default KanbanBoard;
