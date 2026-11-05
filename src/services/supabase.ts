import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from '../types';

const STORAGE_KEY_CONFIG = 'jedalnicek_supabase_config';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse stored Supabase config:', e);
  }

  return { url: '', anonKey: '' };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  try {
    if (!config.url || !config.anonKey) {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    } else {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    }
  } catch (e) {
    console.error('Failed to save Supabase config to storage', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfig: SupabaseConfig = { url: '', anonKey: '' };

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();

  if (!config.url || !config.anonKey) {
    supabaseInstance = null;
    return null;
  }

  if (!supabaseInstance || currentConfig.url !== config.url || currentConfig.anonKey !== config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      });
      currentConfig = { ...config };
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseClient(): void {
  supabaseInstance = null;
}

// SQL schema for Supabase copy-paste
export const SUPABASE_SQL_SCHEMA = `-- 1. Tabuľka pre týždenné plány
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

-- 3. Povoliť Row Level Security (RLS) s verejným prístupom pre dvoch používateľov
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dishes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pristup pre vsetkych k tyzdnom" 
  ON public.weeks FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Pristup pre vsetkych k jedlam" 
  ON public.dishes FOR ALL USING (true) WITH CHECK (true);

-- 4. Povoliť Realtime pre obe tabuľky
ALTER PUBLICATION supabase_realtime ADD TABLE public.weeks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dishes;
`;
