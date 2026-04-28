import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('[main] Starting app initialization...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found!");
  }
  
  console.log('[main] Root element found, rendering app...');
  createRoot(rootElement).render(<App />);
  console.log('[main] App rendered successfully');
} catch (error) {
  console.error('[main] Failed to render app:', error);
  document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;"><h1>App Error</h1><p>${error instanceof Error ? error.message : String(error)}</p></div>`;
}
