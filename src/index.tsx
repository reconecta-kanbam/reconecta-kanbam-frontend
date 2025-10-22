import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// 1 - Configuração de router
// import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

/* ============ Pages =========== */
import KanbanBoard from "./components/kanbanBoard/KanbanBoard";
import AuthPg from "./components/login/AuthPg";
import Occurrences from "./components/occurrences/Occurrences";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    // 3 - Página de Err,
    children: [
      {
        path: "/",
        element: <AuthPg />,
      },
      {
        path: "kanbanBoard",
        element: <KanbanBoard />,
      },
      { path: "occurrences", element: <Occurrences /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
