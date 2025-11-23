import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { SystemSettingsProvider } from "./contexts/SystemSettingsContext";

createRoot(document.getElementById("root")!).render(
  <SystemSettingsProvider>
    <App />
  </SystemSettingsProvider>
);
