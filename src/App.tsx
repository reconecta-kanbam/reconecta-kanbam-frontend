import React from "react";
import KanbanBoard from "./components/kanbanBoard/KanbanBoard";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Meu Kanban</h1>
      <KanbanBoard />
    </div>
  );
}

export default App;
