-- ==========================================================
-- JEDÁLNIČEK PWA - SUPABASE DATABÁZOVÁ SCHÉMA A REALTIME
-- ==========================================================
-- Postup:
-- 1. Otvorte projekt na https://supabase.com
-- 2. Prejdite do sekcie "SQL Editor"
-- 3. Skopírujte a vložte celý tento skript
-- 4. Kliknite na tlačidlo "RUN"
-- ==========================================================

-- 1. Tabuľka pre týždenné plány
CREATE TABLE IF NOT EXISTS public.weeks (
  id TEXT PRIMARY KEY, -- Formát ISO týždňa, napr. "2026-W45"
  days JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT
);

-- 2. Tabuľka pre knižnicu jedál a receptov
CREATE TABLE IF NOT EXISTS public.dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('kuracie', 'hovadzie', 'prilohy', 'oblohy', 'bezmasite', 'dezerty')),
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Zapnutie Row Level Security (RLS)
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

-- 4. Politiky pre neobmedzený prístup (určené pre dvoch používateľov bez nutnosti registrácie)
DROP POLICY IF EXISTS "Pristup pre vsetkych k tyzdnom" ON public.weeks;
CREATE POLICY "Pristup pre vsetkych k tyzdnom" 
  ON public.weeks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Pristup pre vsetkych k jedlam" ON public.dishes;
CREATE POLICY "Pristup pre vsetkych k jedlam" 
  ON public.dishes FOR ALL USING (true) WITH CHECK (true);

-- 5. Zapnutie Realtime synchronizácie pre obe tabuľky
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'weeks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.weeks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dishes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
  END IF;
END $$;

-- 6. Vloženie predvolených jedál (seed data), ak je tabuľka prázdna
INSERT INTO public.dishes (id, name, category, is_favorite)
SELECT * FROM (VALUES
  ('k1', 'Kurací plátok na prírodno', 'kuracie', true),
  ('k2', 'Kuracie rezne v cestíčku', 'kuracie', true),
  ('k3', 'Kuracie soté so zeleninou', 'kuracie', false),
  ('k4', 'Pečené kuracie stehná s cesnakom', 'kuracie', false),
  ('k5', 'Kuracie kari s kokosovým mliekom', 'kuracie', true),
  ('k6', 'Šalát Caesar s grilovaným kuraťom', 'kuracie', false),
  ('k7', 'Kuracie na paprike (paprikáš)', 'kuracie', false),
  ('h1', 'Hovädzí guláš s knedľou', 'hovadzie', true),
  ('h2', 'Sviečková na smotane', 'hovadzie', true),
  ('h3', 'Hovädzie na hubách', 'hovadzie', false),
  ('h4', 'Hovädzí burger s cibuľkou', 'hovadzie', false),
  ('h5', 'Bolognese špagety s parmezánom', 'hovadzie', true),
  ('h6', 'Chilli con carne', 'hovadzie', false),
  ('p1', 'Jazmínová ryža', 'prilohy', true),
  ('p2', 'Pečené zemiaky s rozmarínom', 'prilohy', true),
  ('p3', 'Zemiaková kaša s maslom', 'prilohy', true),
  ('p4', 'Domáce hranolky', 'prilohy', false),
  ('p5', 'Parená knedľa', 'prilohy', false),
  ('p6', 'Kuskus so sušenými paradajkami', 'prilohy', false),
  ('p7', 'Bulgur so zeleninou', 'prilohy', false),
  ('p8', 'Cestoviny penne', 'prilohy', false),
  ('o1', 'Uhorkový šalát s cesnakom', 'oblohy', true),
  ('o2', 'Miešaný listový šalát s dresingom', 'oblohy', true),
  ('o3', 'Paradajkový šalát s cibuľkou', 'oblohy', false),
  ('o4', 'Kyslé uhorky a feferónky', 'oblohy', false),
  ('o5', 'Grilovaná cuketa a paprika', 'oblohy', false),
  ('o6', 'Coleslaw šalát', 'oblohy', true),
  ('b1', 'Vyprážaný syr s tatárskou omáčkou', 'bezmasite', true),
  ('b2', 'Bryndzové halušky so slaninkou', 'bezmasite', true),
  ('b3', 'Krémové hríbové rizoto', 'bezmasite', false),
  ('b4', 'Tofu stir-fry s brokolicou a teriyaki', 'bezmasite', false),
  ('b5', 'Cícerové kari so špenátom', 'bezmasite', false),
  ('b6', 'Špenátové halušky so syrovou omáčkou', 'bezmasite', false),
  ('b7', 'Zapekaná brokolica so zemiakmi', 'bezmasite', false),
  ('d1', 'Domáca jablková štrúdľa', 'dezerty', true),
  ('d2', 'Tvarohový koláč s ovocím', 'dezerty', false),
  ('d3', 'Palacinky s džemom a nutellou', 'dezerty', true),
  ('d4', 'Čokoládové brownies s orechmi', 'dezerty', false),
  ('d5', 'Panna Cotta s malinovým prelivom', 'dezerty', false),
  ('d6', 'Krupicová kaša so škoricou a maslom', 'dezerty', false)
) AS v(id, name, category, is_favorite)
ON CONFLICT (id) DO NOTHING;
