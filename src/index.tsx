import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

/* ============ Pages =========== */
import KanbanBoard from "./components/kanbanBoard/KanbanBoard";
import AuthPg from "./components/login/AuthPg";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import Occurrences from "./components/occurrences/Occurrences";
import Users from "./components/users/Users";
import Settings from "./components/settings/Settings";

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
        path: "kanban-board",
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
      // Redireciona raiz para kanbanBoard
      {
        index: true,
        element: (
          <PrivateRoute>
            <KanbanBoard />
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