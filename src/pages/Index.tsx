import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, Sparkles, TrendingUp, Trophy, Zap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { GameCard } from "@/components/GameCard";
import { NeonButton } from "@/components/NeonButton";
import { GAMES, CATEGORIES, type Category } from "@/data/games";
import { cn } from "@/lib/utils";

const Index = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((g) => {
      const matchesCat = category === "All" || g.category === category;
      const matchesQ =
        !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [query, category]);

  const featured = GAMES[0];
  const totalLive = GAMES.reduce((sum, g) => sum + g.players, 0);

  return (
    <div className="min-h-screen relative">
      {/* Ambient backdrop */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-40 h-[420px] w-[420px] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute top-40 -right-40 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[140px]" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <Navbar />

      <main className="container pt-28 pb-20">
        {/* SEO H1 */}
        <h1 className="sr-only">Gamehub — Premium browser multiplayer gaming</h1>

        {/* HERO */}
        <section className="relative grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                <span className="text-accent">{totalLive.toLocaleString()}</span> players online now
              </span>
            </div>
            <h2 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight">
              Play.{" "}
              <span className="gradient-text text-glow-primary">Compete.</span>
              <br />
              Dominate.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              A premium browser arena for instant multiplayer matches.
              No installs. No friction. Just pure neon-lit competition.
            </p>
            <div className="flex flex-wrap gap-3">
              <NeonButton size="lg" asChild>
                <Link to={featured.href}>
                  <Zap className="h-4 w-4" /> Quick play
                </Link>
              </NeonButton>
              <NeonButton size="lg" variant="secondary" asChild>
                <a href="#games">Browse games</a>
              </NeonButton>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 max-w-md">
              {[
                { label: "Games", value: GAMES.length.toString() },
                { label: "Online", value: `${(totalLive / 1000).toFixed(1)}K` },
                { label: "Matches/d", value: "84K" },
              ].map((s) => (
                <div key={s.label} className="glass rounded-2xl p-3 text-center">
                  <div className="font-display text-2xl font-bold gradient-text">{s.value}</div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Featured card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative animate-float-slow"
          >
            <Link
              to={featured.href}
              className="group block relative overflow-hidden rounded-3xl glass-strong neon-border hover:shadow-glow transition-shadow duration-500"
            >
              <div className="relative aspect-[5/4] overflow-hidden">
                <img
                  src={featured.thumbnail}
                  alt={featured.title}
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-primary-foreground shadow-soft">
                    Featured
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full glass-strong px-2.5 py-1">
                    <span className="live-dot" />
                    <span className="text-[11px] font-mono font-semibold">
                      {featured.players.toLocaleString()} live
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-6">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent">
                    {featured.category}
                  </span>
                  <h3 className="font-display text-3xl font-bold mt-1 mb-1.5">{featured.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-md">{featured.description}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>

        {/* CONTROLS */}
        <section id="games" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-accent mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-mono uppercase tracking-widest">Game library</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold">
                Pick your <span className="gradient-text">battlefield</span>
              </h2>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games…"
                aria-label="Search games"
                className={cn(
                  "w-full glass rounded-2xl pl-10 pr-4 py-3 text-sm font-medium",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-accent/50 focus:shadow-glow-accent",
                  "transition-all duration-200"
                )}
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isActive = c === category;
              const count = c === "All" ? GAMES.length : GAMES.filter((g) => g.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-mono font-semibold uppercase tracking-wider transition-all duration-200",
                    isActive
                      ? "bg-gradient-brand text-primary-foreground shadow-soft"
                      : "glass text-muted-foreground hover:text-foreground hover:border-primary/40"
                  )}
                >
                  {c}
                  <span className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px]",
                    isActive ? "bg-black/25" : "bg-white/5"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((g, i) => (
                <GameCard key={g.id} game={g} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {filtered.length === 0 && (
            <div className="glass rounded-3xl py-20 text-center">
              <Trophy className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
              <p className="font-display text-lg font-bold">No games found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try a different search or category.
              </p>
            </div>
          )}
        </section>

        {/* Footer strip */}
        <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            © Gamehub · Built for players
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="live-dot" /> All systems operational
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
