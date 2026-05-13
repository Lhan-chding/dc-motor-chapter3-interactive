import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "./styles/theme.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/animations.css";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
