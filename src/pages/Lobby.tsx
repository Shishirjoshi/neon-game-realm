import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Plus } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GlassPanel } from "@/components/GlassPanel";
import { NeonButton } from "@/components/NeonButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { createRoomWithUniqueCode } from "@/lib/rooms";
import { GAMES } from "@/data/games";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const SUPPORTED = new Set(["teen-patti", "typing"]);

export default function Lobby() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const game = GAMES.find((g) => g.id === gameId);
  if (!game) return <Navigate to="/" replace />;
  const playable = SUPPORTED.has(gameId!);

  async function handleCreate() {
    if (!user || !game) return;
    setBusy(true);
    try {
      const room = await createRoomWithUniqueCode({
        game_type: game.id as any,
        host_id: user.id,
      });
      // Auto-join host into seat 0
      await supabase.from("room_players").insert({
        room_id: room.id,
        user_id: user.id,
        seat: 0,
      });
      navigate(`/room/${room.code}`);
    } catch (e: any) {
      toast({ title: "Could not create room", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      toast({ title: "Invalid code", description: "Room codes are 6 characters." });
      return;
    }
    setBusy(true);
    try {
      const { data: room, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", trimmed)
        .maybeSingle();
      if (error) throw error;
      if (!room) {
        toast({ title: "Room not found", description: "Double-check the code.", variant: "destructive" });
        return;
      }
      if (room.status !== "waiting") {
        toast({ title: "Already started", description: "This match has begun.", variant: "destructive" });
        return;
      }

      // Find a free seat
      const { data: seated } = await supabase
        .from("room_players")
        .select("seat, user_id")
        .eq("room_id", room.id);
      const taken = new Set((seated ?? []).map((s) => s.seat));
      const already = (seated ?? []).find((s) => s.user_id === user.id);
      if (!already) {
        if ((seated?.length ?? 0) >= room.max_players) {
          toast({ title: "Room full", variant: "destructive" });
          return;
        }
        let seat = 0;
        while (taken.has(seat)) seat++;
        const { error: insErr } = await supabase
          .from("room_players")
          .insert({ room_id: room.id, user_id: user.id, seat });
        if (insErr) throw insErr;
      }
      navigate(`/room/${room.code}`);
    } catch (e: any) {
      toast({ title: "Join failed", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>

      <Navbar />

      <main className="container pt-28 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Game header */}
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-3xl glass-strong neon-border"
          >
            <img
              src={game.thumbnail}
              alt={game.title}
              width={1024}
              height={768}
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
            <div className="relative p-8 flex flex-col justify-end min-h-[280px]">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent">
                {game.category}
              </span>
              <h1 className="font-display text-4xl font-extrabold mt-1">{game.title}</h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">{game.description}</p>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 rounded-full glass px-3 py-1">
                  <span className="live-dot" />
                  <span className="font-mono text-xs">{game.players.toLocaleString()} live</span>
                </div>
                {!playable && (
                  <span className="rounded-full bg-warning/15 text-warning border border-warning/30 px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider">
                    Coming soon
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Create / Join */}
          <div className="grid sm:grid-cols-2 gap-4">
            <GlassPanel strong className="p-6 flex flex-col">
              <div className="h-10 w-10 rounded-xl bg-primary/20 grid place-items-center mb-4">
                <Plus className="h-5 w-5 text-primary-glow" />
              </div>
              <h2 className="font-display text-xl font-bold">Create room</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-6">
                Spin up a private room and invite friends with a code.
              </p>
              <NeonButton
                size="lg"
                className="mt-auto w-full"
                onClick={handleCreate}
                disabled={busy || !playable}
              >
                {playable ? "Create room" : "Coming soon"}
              </NeonButton>
            </GlassPanel>

            <GlassPanel strong className="p-6 flex flex-col">
              <div className="h-10 w-10 rounded-xl bg-accent/20 grid place-items-center mb-4">
                <KeyRound className="h-5 w-5 text-accent" />
              </div>
              <h2 className="font-display text-xl font-bold">Join room</h2>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Got a code from a friend? Drop it below.
              </p>
              <form onSubmit={handleJoin} className="mt-auto space-y-3">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABC123"
                  maxLength={6}
                  className={cn(
                    "w-full glass rounded-xl px-4 py-3 text-center text-xl font-mono font-bold tracking-[0.4em]",
                    "placeholder:text-muted-foreground/40 placeholder:tracking-widest placeholder:font-normal placeholder:text-base",
                    "focus:outline-none focus:border-accent/50 focus:shadow-glow-accent transition-all"
                  )}
                />
                <NeonButton
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={busy || code.length !== 6 || !playable}
                >
                  Join room
                </NeonButton>
              </form>
            </GlassPanel>
          </div>
        </div>
      </main>
    </div>
  );
}
