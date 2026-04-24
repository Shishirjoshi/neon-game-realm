import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "none" | "primary" | "accent";
  strong?: boolean;
}

export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, glow = "none", strong = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          strong ? "glass-strong" : "glass",
          "rounded-3xl",
          glow === "primary" && "shadow-soft",
          glow === "accent" && "shadow-glow-accent",
          className
        )}
        {...props}
      />
    );
  }
);
GlassPanel.displayName = "GlassPanel";
