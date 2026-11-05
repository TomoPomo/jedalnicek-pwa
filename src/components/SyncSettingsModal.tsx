import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Copy, Wifi, Users, Database, ShieldCheck } from 'lucide-react';
import { UserProfile, SupabaseConfig } from '../types';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  SUPABASE_SQL_SCHEMA,
} from '../services/supabase';
import { syncManager, SyncStatus, PresenceUser } from '../services/syncManager';

interface SyncSettingsModalProps {
  isOpen: boolean;
  currentUser: UserProfile;
  activeUsers: PresenceUser[];
  syncStatus: SyncStatus;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const SyncSettingsModal: React.FC<SyncSettingsModalProps> = ({
  isOpen,
  currentUser,
  activeUsers,
  syncStatus,
  onUpdateUser,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [userName, setUserName] = useState(currentUser.name);
  const [userColor, setUserColor] = useState(currentUser.color);

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseAnonKey(config.anonKey);
    setUserName(currentUser.name);
    setUserColor(currentUser.color);
  }, [isOpen, currentUser]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name: userName.trim() || 'Používateľ', color: userColor });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    const config: SupabaseConfig = {
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
    };
    saveStoredSupabaseConfig(config);
    syncManager.initSupabaseSync();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearSupabase = () => {
    saveStoredSupabaseConfig({ url: '', anonKey: '' });
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    syncManager.initSupabaseSync();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const colorPresets = [
    { label: 'Modrá', val: '#3b82f6' },
    { label: 'Ružová', val: '#ec4899' },
    { label: 'Zelená', val: '#10b981' },
    { label: 'Fialová', val: '#a855f7' },
    { label: 'Oranžová', val: '#f97316' },
    { label: 'Žltá', val: '#eab308' },
  ];

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto bg-[#18181b] text-[#f4f4f5] border border-[#27272a] rounded-2xl w-[94%] max-w-lg shadow-2xl p-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm z-50 flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-semibold text-white">Real-time synchronizácia</h2>
            <p className="text-xs text-zinc-400">Nastavenie profilu a cloudovej databázy pre dvoch</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Zatvoriť"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Connection Status Banner */}
        <div className="p-3 rounded-xl bg-[#121212] border border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <div>
              <div className="text-xs font-semibold text-zinc-200">
                {syncStatus === 'connected'
                  ? 'Pripojené k Supabase Cloud'
                  : syncStatus === 'local'
                  ? 'Lokálna synchronizácia (Multi-tab & Offline)'
                  : 'Pripája sa k serveru...'}
              </div>
              <div className="text-[11px] text-zinc-400">
                {activeUsers.length} aktívny{activeUsers.length === 1 ? '' : 'ch'} používateľ{activeUsers.length === 1 ? '' : 'ia'} v aplikácii
              </div>
            </div>
          </div>

          <div className="flex items-center -space-x-1.5">
            {activeUsers.map((u) => (
              <div
                key={u.id}
                style={{ backgroundColor: u.color }}
                className="w-6 h-6 rounded-full border-2 border-[#18181b] flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                title={`${u.name} (online)`}
              >
                {u.name.substring(0, 1).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        {/* User Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 p-3.5 bg-[#141417] border border-[#27272a] rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Môj profil v aplikácii</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: userColor }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner shrink-0"
            >
              {userName ? userName.charAt(0).toUpperCase() : '?'}
            </div>

            <div className="flex-1">
              <label className="block text-[11px] text-zinc-400 mb-1">Meno / Prezývka</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="napr. Tomo alebo Zuzka"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Farba avatara</label>
            <div className="flex items-center gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setUserColor(preset.val)}
                  style={{ backgroundColor: preset.val }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    userColor === preset.val ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
          >
            Uložiť profil
          </button>
        </form>

        {/* Supabase Configuration */}
        <form onSubmit={handleSaveSupabase} className="space-y-3 p-3.5 bg-[#141417] border border-[#27272a] rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Cloud (pre 2 telefóny)</span>
            </div>
            {supabaseUrl && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3" /> Nastavené
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Pre okamžité prepojenie dvoch rôznych telefónov zadaj svoje bezplatné prihlasovacie údaje zo Supabase.
          </p>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Project URL</label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">Anon / Public API Key</label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!supabaseUrl.trim() || !supabaseAnonKey.trim()}
              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Uložiť & Prepojiť</span>
            </button>

            {supabaseUrl && (
              <button
                type="button"
                onClick={handleClearSupabase}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg"
              >
                Odpojiť
              </button>
            )}
          </div>
        </form>

        {/* Supabase SQL Instructions */}
        <div className="p-3.5 bg-[#121212] border border-[#27272a] rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">SQL príkaz pre Supabase (1 klik):</span>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[11px] font-medium transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Skopírované!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Kopírovať SQL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            V Supabase prejdite do <strong>SQL Editor</strong>, vložte tento kód a stlačte <strong>RUN</strong>. Vytvorí potrebné tabuľky a zapne Realtime.
          </p>
          <pre className="bg-[#18181b] p-2 rounded-lg text-[10px] text-zinc-400 font-mono overflow-x-auto max-h-24 no-scrollbar border border-zinc-800">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {saveSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs text-center font-medium">
            Nastavenia boli úspešne uložené!
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[#27272a] bg-[#141417] flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors"
        >
          Zatvoriť
        </button>
      </div>
    </dialog>
  );
};
