import React from "react";
import { Toaster } from "sonner";

/* ============ 2 - Reaproveitamento  de estrutura =========== */
import { Outlet, useLocation } from "react-router-dom";

/* ============ Styles Global - SCSS/Tailwind =========== */
import "./styles/scss/App.css";

// /* ============ Header e Footer - Global =========== */
import Header from "./components/header/header";
import Footer from "./components/footer/footer";

const App: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <Header />
      <Toaster position="top-right" richColors />
      <Outlet />
      {location.pathname !== "/login" && <Footer />}
    </>
  );
};

export default App;
