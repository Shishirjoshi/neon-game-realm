import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { SocketProvider } from "@/contexts/SocketContext";
import { GameProvider } from "@/contexts/GameContext";

const queryClient = new QueryClient();

const TestPage = () => {
  return (
    <div style={{ padding: '40px', color: 'white', background: '#1a1a1a', minHeight: '100vh' }}>
      <h1>✅ Gamehub Loaded Successfully!</h1>
      <p>App is working - just need to load components gradually</p>
      <ul style={{ marginTop: '20px', lineHeight: '1.8' }}>
        <li>✓ QueryClient working</li>
        <li>✓ Socket provider working</li>
        <li>✓ Game provider working</li>
        <li>✓ Router working</li>
      </ul>
    </div>
  );
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="*" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
};

const SimpleApp = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log('[App] Starting initialization...');
      setIsReady(true);
    } catch (err) {
      console.error('[App] Init error:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', fontFamily: 'monospace' }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!isReady) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default SimpleApp;
