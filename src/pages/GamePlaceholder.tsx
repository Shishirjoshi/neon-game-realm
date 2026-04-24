import { Navigate, useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { GlassPanel } from "@/components/GlassPanel";
import { NeonButton } from "@/components/NeonButton";
import { Construction } from "lucide-react";

export default function GamePlaceholder({ title }: { title: string }) {
  const { code } = useParams();
  return (
    <div className="min-h-screen relative">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-25" />
      </div>
      <Navbar />
      <main className="container pt-32 pb-20">
        <GlassPanel strong className="p-10 text-center max-w-xl mx-auto">
          <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/15 grid place-items-center mb-4">
            <Construction className="h-7 w-7 text-primary-glow" />
          </div>
          <h1 className="font-display text-2xl font-extrabold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Game table UI coming next. Room <span className="font-mono text-accent">{code}</span> is live.
          </p>
          <NeonButton asChild className="mt-6">
            <a href="/">Back to hub</a>
          </NeonButton>
        </GlassPanel>
      </main>
    </div>
  );
}
