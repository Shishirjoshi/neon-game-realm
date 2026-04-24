import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Search, Trophy, User, Gamepad2, Home, Coins, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NeonButton } from "./NeonButton";
import { PlayerAvatar } from "./PlayerAvatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container">
        <nav
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled
              ? "glass-strong shadow-soft"
              : "bg-transparent border border-transparent"
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-brand grid place-items-center shadow-soft">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-xl bg-gradient-brand blur-md opacity-50 group-hover:opacity-80 transition-opacity -z-10" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight">
              GAME<span className="gradient-text">HUB</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-foreground bg-white/5"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      {isActive && (
                        <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-brand" />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              className="hidden md:flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-56"
              aria-label="Search games"
            >
              <Search className="h-4 w-4" />
              <span>Search games…</span>
              <kbd className="ml-auto font-mono text-[10px] text-muted-foreground/70 border border-white/10 rounded px-1.5 py-0.5">⌘K</kbd>
            </button>

            {/* Coins */}
            <div className="hidden sm:flex items-center gap-2 rounded-xl glass px-3 py-2">
              <Coins className="h-4 w-4 text-accent" />
              <span className="font-mono text-sm font-semibold tabular-nums">
                12,480
              </span>
            </div>

            {/* Avatar / login */}
            <NeonButton variant="secondary" size="sm" className="hidden sm:inline-flex">
              Sign in
            </NeonButton>
            <PlayerAvatar name="You" size="sm" />

            {/* Mobile toggle */}
            <button
              className="lg:hidden ml-1 rounded-lg p-2 text-foreground hover:bg-white/5"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-3 animate-fade-in">
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                        isActive
                          ? "bg-white/5 text-foreground"
                          : "text-muted-foreground hover:bg-white/5"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
