# 🍽️ Jedálniček – Responzívna PWA aplikácia pre dvoch

Moderná webová PWA aplikácia pre týždenné plánovanie jedál určená pre dvoch používateľov s real-time synchronizáciou cez **Supabase** (s automatickým lokálnym fallbackom cez `BroadcastChannel`).

Optimalizovaná pre **maximálnu informačnú hustotu na mobilnom displeji** (Dark UI, 7 dní na jednej obrazovke bez scrollovania, kompaktné farebné štítky, inline editácia a skladanie obeda).

---

## ✨ Kľúčové Funkcie

### 1. Týždenný prehľad (Dashboard)
- **7 dní (PO až NE) na jednej obrazovke** bez zbytočného vertikálneho scrollovania.
- Každý deň má 3 prehľadné riadky s farebnými štítkami:
  - `[R]` **Raňajky** (oranžový štítok)
  - `[O]` **Obed** (modrý štítok)
  - `[V]` **Večera** (zelený štítok)
- **Prepínač týždňov**: `[◀ Týždeň X ▶]` s rýchlymi tlačidlami `[Tento týždeň]` a `[Budúci týždeň]`.
- **Inline editácia**: kliknutie na text slotu okamžite otvorí inline textové pole pre priame písanie s automatickým 300ms debounce ukladaním.
- **Našepkávač (Typeahead / Autocomplete)**: pri písaní v slote sa zobrazujú relevantné návrhy priamo z knižnice jedál.
- **Akcie týždňa**:
  - `Kopírovať do budúceho týždňa`
  - `Vyčistiť týždeň`

### 2. Knižnica jedál & Bottom Sheet Skladačka
- 6 presných kategórií:
  1. **Kuracie** 🍗
  2. **Hovädzie** 🥩
  3. **Prílohy** 🍚
  4. **Oblohy** 🥗
  5. **Bezmäsité** 🧀
  6. **Dezerty** 🍰
- **Bottom Sheet Drawer**:
  - Otvára sa ťuknutím na badge alebo ikonu knižnice pri ktoromkoľvek jedle.
  - **1-klik výber**: rýchle priradenie jedla jediným ťuknutím.
  - **Režim "Skladačka" (Multi-component composer)**: umožňuje naklikať viacero zložiek (napr. *Kurací plátok na prírodno* + *Jazmínová ryža* + *Uhorkový šalát*) a použiť ich spojené.
  - **Rýchle pridanie nového jedla** priamo vo vysunutom paneli.
  - Horizontálny pás kategórií s počtami a obľúbenými položkami (⭐).

### 3. Real-time synchronizácia & Dvaja používatelia
- **Zelená pulzujúca bodka "Live sync"**: okamžitý prehľad o stave prepojenia.
- **Zobrazenie aktívnych používateľov**: avatary oboch používateľov (napr. *Ja* a *Partner*) s farebnými odznakmi.
- **Možnosť nastavenia profilu**: vlastné meno a farba avatara.
- **Dva režimy synchronizácie**:
  1. **Supabase Cloud**: prepojenie dvoch rôznych telefónov/zariadení cez internet s PostgreSQL Realtime zmenami a Presence kanálom.
  2. **Lokálny režim (BroadcastChannel)**: funguje okamžite bez akejkoľvek konfigurácie medzi dvoma otvorenými kartami prehliadača alebo v offline režime.

### 4. PWA (Progressive Web App)
- Inštalovateľná na plochu iOS / Android ako natívna aplikácia.
- Standalone zobrazenie bez adresného riadku prehliadača.
- Dark theme status bar (`#121212`) s podporou `safe-area-inset`.
- Service worker caching pre offline prístup.

---

## 🚀 Spustenie projektu

### Požiadavky
- Node.js 18+ (odporúčané Node 20+)
- npm

### 1. Inštalácia závislostí
```bash
npm install
```

### 2. Spustenie vývojového servera
```bash
npm run dev
```

### 3. Zostavenie pre produkciu
```bash
npm run build
npm run preview
```

---

## 🗄️ Nastavenie Supabase (pre synchronizáciu medzi 2 telefónmi)

1. Vytvorte si bezplatný projekt na [supabase.com](https://supabase.com).
2. V sekcii **SQL Editor** vložte a spustite nasledujúci SQL skript (je dostupný aj priamo v aplikácii cez ⚙️ Nastavenia -> *Kopírovať SQL*):

```sql
-- 1. Tabuľka pre týždenné plány
CREATE TABLE IF NOT EXISTS public.weeks (
  id TEXT PRIMARY KEY, -- napr. "2026-W45"
  days JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by TEXT
);

-- 2. Tabuľka pre knižnicu jedál
CREATE TABLE IF NOT EXISTS public.dishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Row Level Security (RLS) s verejným prístupom pre dvoch používateľov
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pristup pre vsetkych k tyzdnom" 
  ON public.weeks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Pristup pre vsetkych k jedlam" 
  ON public.dishes FOR ALL USING (true) WITH CHECK (true);

-- 4. Zapnutie Realtime synchronizácie
ALTER PUBLICATION supabase_realtime ADD TABLE public.weeks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
```

3. V aplikácii kliknite na ikonu **⚙️ Nastavenia** vpravo hore:
   - Vložte **Project URL** (napr. `https://xyz.supabase.co`)
   - Vložte **Anon / Public API Key**
   - Kliknite na **Uložiť & Prepojiť**
4. Alternatívne môžete vytvoriť súbor `.env.local`:
```env
VITE_SUPABASE_URL=https://tvoj-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=tvoj-anon-key
```

Oba telefóny budú od tej chvíle okamžite synchronizované v reálnom čase!
