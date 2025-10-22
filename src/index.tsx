import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext"; // Adicionado

/* ============ Pages =========== */
import KanbanBoard from "./components/kanbanBoard/KanbanBoard";
import AuthPg from "./components/login/AuthPg";
import Dashboard from "./components/dashboard/Dashboard";
import ProjectsList from "./components/projects/ProjectsList";
import Occurrences from "./components/occurrences/Occurrences";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute"; // Adicionado

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: <AuthPg />,
      },
      {
        path: "kanbanBoard",
        element: <PrivateRoute><KanbanBoard /></PrivateRoute>,
      },
      {
        path: "dashboard",
        element: <PrivateRoute><Dashboard /></PrivateRoute>,
      },
      {
        path: "projects",
        element: <PrivateRoute><ProjectsList /></PrivateRoute>,
      },
      {
        path: "occurrences",
        element: <PrivateRoute><Occurrences /></PrivateRoute>,
      },
      // Redireciona raiz para kanbanBoard (protegido)
      {
        path: "/",
        element: <PrivateRoute><KanbanBoard /></PrivateRoute>,
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