import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Copy, LogOut, Play, Users, Check } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GlassPanel } from "@/components/GlassPanel";
import { NeonButton } from "@/components/NeonButton";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { GAMES } from "@/data/games";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  code: string;
  game_type: string;
  host_id: string;
  status: string;
  max_players: number;
  min_players: number;
}
interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  seat: number;
  is_ready: boolean;
  status: string;
  joined_at: string;
}
interface PlayerWithProfile extends RoomPlayer {
  profile: { username: string; avatar_url: string | null } | null;
}

export default function Room() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<PlayerWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const game = useMemo(
    () => (room ? GAMES.find((g) => g.id === room.game_type) : null),
    [room]
  );
  const me = useMemo(() => players.find((p) => p.user_id === user?.id), [players, user]);
  const isHost = user && room?.host_id === user.id;
  const readyCount = players.filter((p) => p.is_ready || p.user_id === room?.host_id).length;
  const canStart = !!isHost && players.length >= (room?.min_players ?? 2) && players.every((p) => p.is_ready || p.user_id === room?.host_id);

  // Load + subscribe
  useEffect(() => {
    if (!code || !user) return;
    let mounted = true;

    async function load() {
      const { data: r } = await supabase.from("rooms").select("*").eq("code", code as string).maybeSingle();
      if (!mounted) return;
      if (!r) {
        toast({ title: "Room not found", variant: "destructive" });
        navigate("/");
        return;
      }
      setRoom(r as Room);
      await refreshPlayers(r.id);

      if (r.status === "in_progress") {
        navigateToGame(r.game_type, r.code);
      }
      setLoading(false);

      const channel = supabase
        .channel(`room:${r.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "room_players", filter: `room_id=eq.${r.id}` }, () => {
          refreshPlayers(r.id);
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${r.id}` }, (payload) => {
          const next = payload.new as Room;
          setRoom(next);
          if (next.status === "in_progress") {
            navigateToGame(next.game_type, next.code);
          }
        })
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "rooms", filter: `id=eq.${r.id}` }, () => {
          toast({ title: "Room closed", description: "The host ended this room." });
          navigate("/");
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    let cleanup: (() => void) | undefined;
    load().then((c) => { cleanup = c as any; });
    return () => { mounted = false; cleanup?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, user?.id]);

  function navigateToGame(gt: string, c: string) {
    if (gt === "teen-patti") navigate(`/play/teen-patti/${c}`);
    else if (gt === "typing") navigate(`/play/typing/${c}`);
  }

  async function refreshPlayers(roomId: string) {
    const { data: rp } = await supabase
      .from("room_players")
      .select("*")
      .eq("room_id", roomId)
      .order("seat");
    const ids = (rp ?? []).map((p) => p.user_id);
    let profilesMap: Record<string, { username: string; avatar_url: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id,username,avatar_url")
        .in("user_id", ids);
      profilesMap = Object.fromEntries((profs ?? []).map((p) => [p.user_id, { username: p.username, avatar_url: p.avatar_url }]));
    }
    setPlayers((rp ?? []).map((p) => ({ ...(p as RoomPlayer), profile: profilesMap[p.user_id] ?? null })));
  }

  async function copyCode() {
    if (!room) return;
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast({ title: "Code copied", description: room.code });
  }

  async function toggleReady() {
    if (!me) return;
    setBusy(true);
    await supabase
      .from("room_players")
      .update({ is_ready: !me.is_ready })
      .eq("id", me.id);
    setBusy(false);
  }

  async function leave() {
    if (!user || !room) return;
    setBusy(true);
    if (isHost) {
      await supabase.from("rooms").delete().eq("id", room.id);
    } else {
      await supabase.from("room_players").delete().eq("room_id", room.id).eq("user_id", user.id);
    }
    navigate("/");
  }

  async function start() {
    if (!room || !canStart) return;
    setBusy(true);
    const { error } = await supabase
      .from("rooms")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", room.id);
    setBusy(false);
    if (error) toast({ title: "Failed to start", description: error.message, variant: "destructive" });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Navbar />
        <div className="font-mono text-muted-foreground text-sm">Loading room…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!room || !game) return null;

  // Build seats array
  const seats: (PlayerWithProfile | null)[] = Array.from({ length: room.max_players }, (_, i) => {
    return players.find((p) => p.seat === i) ?? null;
  });

  return (
    <div className="min-h-screen relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>

      <Navbar />

      <main className="container pt-28 pb-20">
        <button
          onClick={() => navigate(`/lobby/${room.game_type}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Lobby
        </button>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
          {/* Room code panel */}
          <GlassPanel strong className="p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-brand opacity-[0.06] pointer-events-none" />
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
              {game.title}
            </span>
            <p className="mt-2 text-sm text-muted-foreground">Share this code with your crew</p>

            <div className="mt-6 mb-2 font-display font-extrabold text-5xl sm:text-6xl tracking-[0.25em] gradient-text text-glow-primary">
              {room.code}
            </div>

            <button
              onClick={copyCode}
              className={cn(
                "mt-2 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium transition-all",
                "hover:border-accent/40"
              )}
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy code"}
            </button>

            <div className="mt-8 w-full grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-3">
                <div className="font-display text-2xl font-bold">
                  {players.length}<span className="text-muted-foreground/50">/{room.max_players}</span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Players</div>
              </div>
              <div className="glass rounded-2xl p-3">
                <div className="font-display text-2xl font-bold">
                  {readyCount}<span className="text-muted-foreground/50">/{players.length}</span>
                </div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">Ready</div>
              </div>
            </div>

            <div className="mt-6 w-full flex flex-col gap-2">
              {!isHost && me && (
                <NeonButton
                  variant={me.is_ready ? "secondary" : "accent"}
                  size="lg"
                  className="w-full"
                  onClick={toggleReady}
                  disabled={busy}
                >
                  {me.is_ready ? "Cancel ready" : "I'm ready"}
                </NeonButton>
              )}
              {isHost && (
                <NeonButton
                  size="lg"
                  className="w-full"
                  onClick={start}
                  disabled={!canStart || busy}
                >
                  <Play className="h-4 w-4" fill="currentColor" />
                  {canStart ? "Start game" : `Waiting (${players.length}/${room.min_players})`}
                </NeonButton>
              )}
              <NeonButton variant="ghost" size="md" className="w-full text-muted-foreground" onClick={leave} disabled={busy}>
                <LogOut className="h-4 w-4" /> {isHost ? "Close room" : "Leave room"}
              </NeonButton>
            </div>
          </GlassPanel>

          {/* Players panel */}
          <GlassPanel strong className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" /> Players
              </h2>
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Live
              </span>
            </div>

            <ul className="grid sm:grid-cols-2 gap-3">
              <AnimatePresence initial={false}>
                {seats.map((p, i) => (
                  <motion.li
                    key={p?.id ?? `empty-${i}`}
                    layout
                    initial={{ opacity: 0, scale: 0.92, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -8 }}
                    transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                    className={cn(
                      "rounded-2xl p-3 flex items-center gap-3 border transition-colors",
                      p
                        ? "glass border-white/10"
                        : "border-dashed border-white/5 bg-white/[0.02]"
                    )}
                  >
                    {p ? (
                      <>
                        <PlayerAvatar
                          name={p.profile?.username ?? "Player"}
                          src={p.profile?.avatar_url ?? undefined}
                          size="lg"
                          isHost={p.user_id === room.host_id}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-display font-bold truncate">
                            {p.profile?.username ?? "Player"}
                            {p.user_id === user.id && (
                              <span className="ml-1.5 text-[10px] font-mono uppercase tracking-wider text-accent">you</span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground">Seat {p.seat + 1}</div>
                        </div>
                        <StatusBadge
                          status={p.user_id === room.host_id ? "host" : p.is_ready ? "ready" : "waiting"}
                        />
                      </>
                    ) : (
                      <>
                        <div className="h-14 w-14 rounded-full border border-dashed border-white/10 grid place-items-center text-muted-foreground/50 font-mono">
                          {i + 1}
                        </div>
                        <div className="text-sm text-muted-foreground/60 font-mono">Open seat</div>
                      </>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </GlassPanel>
        </div>
      </main>
    </div>
  );
}
