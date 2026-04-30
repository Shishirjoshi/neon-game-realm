import { supabase } from "@/integrations/supabase/client";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateRoomCode(len = 6): string {
  let out = "";
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return out;
}

export async function createRoomWithUniqueCode(opts: {
  game_type:
    | "teen-patti"
    | "glass-chess";
  host_id: string;
  max_players?: number;
  min_players?: number;
}) {
  // Try a few times in the unlikely case of collision
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        game_type: opts.game_type,
        host_id: opts.host_id,
        max_players: opts.max_players ?? 6,
        min_players: opts.min_players ?? 2,
      })
      .select()
      .single();
    if (!error && data) return data;
    if (error && !`${error.message}`.includes("rooms_code_key")) throw error;
  }
  throw new Error("Could not generate a unique room code");
}
