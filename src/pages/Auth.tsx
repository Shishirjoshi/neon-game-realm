import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Gamepad2, Mail, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { NeonButton } from "@/components/NeonButton";
import { GlassPanel } from "@/components/GlassPanel";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { username: username || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast({ title: "Welcome to Gamehub", description: "Account created. You're in." });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Signed in", description: "Game on." });
        navigate("/");
      }
    } catch (err: any) {
      toast({
        title: "Authentication failed",
        description: err.message ?? "Check your details and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full bg-primary/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-11 w-11 rounded-xl bg-gradient-brand grid place-items-center shadow-soft">
              <Gamepad2 className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-2xl font-extrabold tracking-tight">
              GAME<span className="gradient-text">HUB</span>
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "signup" ? "Drop into the arena in seconds." : "Sign in to keep climbing the ranks."}
          </p>
        </div>

        <GlassPanel strong className="p-6 sm:p-8">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 mb-6">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "py-2 rounded-lg text-sm font-mono font-semibold uppercase tracking-wider transition-all",
                  mode === m
                    ? "bg-gradient-brand text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Field
                icon={<User className="h-4 w-4" />}
                placeholder="Username"
                value={username}
                onChange={(v) => setUsername(v)}
              />
            )}
            <Field
              icon={<Mail className="h-4 w-4" />}
              placeholder="Email"
              type="email"
              required
              value={email}
              onChange={setEmail}
            />
            <Field
              icon={<Lock className="h-4 w-4" />}
              placeholder="Password"
              type="password"
              required
              value={password}
              onChange={setPassword}
              minLength={6}
            />
            <NeonButton type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </NeonButton>
          </form>
        </GlassPanel>
        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing you agree to play fair and have fun.
        </p>
      </motion.div>
    </div>
  );
}

function Field({
  icon,
  ...props
}: {
  icon: React.ReactNode;
  placeholder: string;
  type?: string;
  required?: boolean;
  minLength?: number;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          type={props.type ?? "text"}
          required={props.required}
          minLength={props.minLength}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          className="w-full glass rounded-xl pl-10 pr-4 py-3 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 focus:shadow-glow-accent transition-all"
        />
      </div>
    </label>
  );
}
