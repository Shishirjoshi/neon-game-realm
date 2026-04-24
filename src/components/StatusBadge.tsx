import { cn } from "@/lib/utils";

type Status = "ready" | "waiting" | "blind" | "seen" | "folded" | "all-in" | "live" | "host";

const STYLES: Record<Status, string> = {
  ready:    "bg-success/15 text-success border-success/30",
  waiting:  "bg-warning/15 text-warning border-warning/30",
  blind:    "bg-primary/15 text-primary-glow border-primary/30",
  seen:     "bg-accent/15 text-accent border-accent/30",
  folded:   "bg-muted/40 text-muted-foreground border-white/10",
  "all-in": "bg-destructive/15 text-destructive border-destructive/30",
  live:     "bg-success/15 text-success border-success/30",
  host:     "bg-gradient-brand text-primary-foreground border-transparent",
};

const LABELS: Record<Status, string> = {
  ready: "Ready",
  waiting: "Waiting",
  blind: "Blind",
  seen: "Seen",
  folded: "Folded",
  "all-in": "All-in",
  live: "Live",
  host: "Host",
};

export function StatusBadge({ status, className, label }: { status: Status; className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider",
        STYLES[status],
        className
      )}
    >
      {(status === "live" || status === "ready") && <span className="live-dot" />}
      {label ?? LABELS[status]}
    </span>
  );
}
