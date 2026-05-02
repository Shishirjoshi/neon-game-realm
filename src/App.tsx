import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/SocketContext";
import { GameProvider } from "@/contexts/GameContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Lobby from "./pages/Lobby.tsx";
import Room from "./pages/Room.tsx";
import TeenPattiGame from "./pages/TeenPattiGame.tsx";
import ChessOffline from "./pages/ChessOffline.tsx";
import GamePlaceholder from "./pages/GamePlaceholder.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <ErrorBoundary>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/lobby/:gameId" element={<Lobby />} />
                  <Route path="/room/:code" element={<Room />} />
                  <Route path="/play/teen-patti/:code" element={<TeenPattiGame />} />
                  <Route path="/play/chess-offline" element={<ChessOffline />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ErrorBoundary>
          </TooltipProvider>
        </GameProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
};

export default App;
