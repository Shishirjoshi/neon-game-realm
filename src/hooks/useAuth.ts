import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  coins: number;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      console.log('🔐 useAuth initializing...');
      
      // Listener FIRST
      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        console.log('🔄 Auth state changed:', _event, 'Session:', !!newSession);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (!newSession?.user) {
          setProfile(null);
        } else {
          // Defer profile fetch to avoid deadlock
          console.log('👤 Fetching profile for user:', newSession.user.id);
          setTimeout(() => fetchProfile(newSession.user.id), 0);
        }
      });

      // Then existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('✅ Got existing session:', !!session);
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('👤 Fetching profile for existing user:', session.user.id);
          fetchProfile(session.user.id).finally(() => {
            console.log('✅ useAuth loading complete');
            setLoading(false);
          });
        } else {
          console.log('📵 No existing session');
          setLoading(false);
        }
      }).catch((error) => {
        console.error('❌ Failed to get session:', error);
        setLoading(false);
      });

      return () => {
        console.log('🧹 Cleaning up auth listener');
        sub.subscription.unsubscribe();
      };
    } catch (error) {
      console.error('❌ Failed to initialize auth:', error);
      setLoading(false);
    }
  }, []);

  async function fetchProfile(userId: string) {
    console.log('🔍 Fetching profile for:', userId);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      console.log('👤 Profile data:', data);
      if (data) setProfile(data as Profile);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id);
  }

  return { session, user, profile, loading, refreshProfile };
}
