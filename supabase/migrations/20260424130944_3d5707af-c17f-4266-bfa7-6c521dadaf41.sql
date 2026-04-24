-- =========================================
-- ENUMS
-- =========================================
CREATE TYPE public.app_role AS ENUM ('admin', 'player');
CREATE TYPE public.game_type AS ENUM ('teen-patti', 'typing', 'neon-strike', 'velocity-rush', 'block-blast', 'glass-chess');
CREATE TYPE public.room_status AS ENUM ('waiting', 'in_progress', 'finished');
CREATE TYPE public.player_status AS ENUM ('waiting', 'ready', 'playing', 'folded', 'out');

-- =========================================
-- UTILITY: updated_at trigger
-- =========================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  coins INTEGER NOT NULL DEFAULT 10000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data ->> 'username',
    split_part(NEW.email, '@', 1),
    'Player' || substr(NEW.id::text, 1, 6)
  );

  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, v_username);

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'player');

  RETURN NEW;
END;
$$;

-- =========================================
-- USER ROLES (separate table — never on profiles)
-- =========================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Now create the trigger that uses both tables
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- ROOMS
-- =========================================
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  game_type game_type NOT NULL,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status room_status NOT NULL DEFAULT 'waiting',
  max_players INTEGER NOT NULL DEFAULT 6,
  min_players INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ
);

CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_game_type ON public.rooms(game_type);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms are viewable by authenticated users"
  ON public.rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rooms"
  ON public.rooms FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their rooms"
  ON public.rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their rooms"
  ON public.rooms FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

CREATE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- ROOM PLAYERS
-- =========================================
CREATE TABLE public.room_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seat INTEGER NOT NULL,
  status player_status NOT NULL DEFAULT 'waiting',
  is_ready BOOLEAN NOT NULL DEFAULT false,
  coins INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, user_id),
  UNIQUE (room_id, seat)
);

CREATE INDEX idx_room_players_room ON public.room_players(room_id);
CREATE INDEX idx_room_players_user ON public.room_players(user_id);

ALTER TABLE public.room_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room players are viewable by authenticated users"
  ON public.room_players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can join rooms"
  ON public.room_players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Players can update their own seat"
  ON public.room_players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Players can leave their seat or host can remove"
  ON public.room_players FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = room_id AND r.host_id = auth.uid()
    )
  );

-- =========================================
-- REALTIME
-- =========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_players;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_players REPLICA IDENTITY FULL;