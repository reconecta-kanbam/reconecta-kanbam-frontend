import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

/* ============ Styles Global - SCSS/Tailwind =========== */
import './styles/scss/App.css';

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
