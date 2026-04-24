import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";

interface PlayerAvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  isHost?: boolean;
  isActive?: boolean;
  className?: string;
}

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function PlayerAvatar({ name, src, size = "md", isHost, isActive, className }: PlayerAvatarProps) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-full font-display font-bold flex items-center justify-center overflow-hidden",
          "bg-gradient-brand text-primary-foreground",
          "ring-2 ring-white/10 transition-all duration-300",
          isActive && "ring-accent shadow-glow-accent animate-pulse-glow",
          SIZES[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span>{initials || "?"}</span>
        )}
      </div>
      {isHost && (
        <span className="absolute -top-1 -right-1 rounded-full bg-accent text-accent-foreground p-1 shadow-[0_0_12px_hsl(var(--accent)/0.6)]">
          <Crown className="h-3 w-3" strokeWidth={2.5} />
        </span>
      )}
    </div>
  );
}
