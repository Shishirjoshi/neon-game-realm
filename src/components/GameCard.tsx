import { motion } from "framer-motion";
import { Play, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NeonButton } from "./NeonButton";

export interface Game {
  id: string;
  title: string;
  category: string;
  players: number;
  thumbnail: string;
  description: string;
  href: string;
  hot?: boolean;
}

export function GameCard({ game, index = 0 }: { game: Game; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative"
    >
      <Link
        to={game.href}
        className={cn(
          "block relative overflow-hidden rounded-3xl",
          "glass transition-all duration-300",
          "hover:border-accent/50 hover:shadow-glow-accent"
        )}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={game.thumbnail}
            alt={`${game.title} game thumbnail`}
            loading="lazy"
            width={1024}
            height={768}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Top row: live + hot */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 rounded-full glass-strong px-2.5 py-1">
              <span className="live-dot" />
              <span className="text-[11px] font-mono font-semibold text-foreground">
                {game.players.toLocaleString()}
              </span>
              <Users className="h-3 w-3 text-muted-foreground" />
            </div>
            {game.hot && (
              <span className="rounded-full bg-gradient-brand px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-primary-foreground shadow-soft">
                Hot
              </span>
            )}
          </div>

          {/* Category */}
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-accent">
              {game.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-lg font-bold leading-tight truncate">
                {game.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                {game.description}
              </p>
            </div>
            <NeonButton
              size="sm"
              variant="primary"
              className="opacity-90 group-hover:opacity-100"
              tabIndex={-1}
            >
              <Play className="h-3.5 w-3.5" fill="currentColor" />
              Play
            </NeonButton>
          </div>
        </div>

        {/* Glow border on hover */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary)/0.18), transparent 50%, hsl(var(--accent)/0.18))",
          }}
        />
      </Link>
    </motion.div>
  );
}
