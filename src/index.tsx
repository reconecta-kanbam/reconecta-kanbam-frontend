// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

/* ============ Pages =========== */
import KanbanBoard from "./components/kanbanBoard/KanbanBoard"; // 👈 DESCOMENTE/IMPORTE
import AuthPg from "./components/login/AuthPg";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Occurrences from "./components/occurrences/Occurrences";
import Users from "./components/users/Users";
import Settings from "./components/settings/Settings";
import Logs from "./components/logs/Logs";
import Setores from "./components/sectors/Sectors";
import Workflows from "./components/workflows/Workflows";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <AuthPg />,
      },
      {
        path: "workflows",
        element: (
          <PrivateRoute>
            <Workflows />
          </PrivateRoute>
        ),
      },
      {
        path: "kanban-board", // 👈 ADICIONE ESTA ROTA
        element: (
          <PrivateRoute>
            <KanbanBoard />
          </PrivateRoute>
        ),
      },
      {
        path: "occurrence",
        element: (
          <PrivateRoute>
            <Occurrences />
          </PrivateRoute>
        ),
      },
      {
        path: "users",
        element: (
          <PrivateRoute>
            <Users />
          </PrivateRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        ),
      },
      {
        path: "logs",
        element: (
          <PrivateRoute>
            <Logs />
          </PrivateRoute>
        ),
      },
      {
        path: "setores",
        element: (
          <PrivateRoute>
            <Setores />
          </PrivateRoute>
        ),
      },
      {
        index: true,
        element: (
          <PrivateRoute>
            <Workflows />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);