import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Copy, Wifi, Users, Database, ShieldCheck, QrCode, Share2 } from 'lucide-react';
import QRCode from 'qrcode';
import { UserProfile, SupabaseConfig } from '../types';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  generateConnectionLink,
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
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [userName, setUserName] = useState(currentUser.name);
  const [userColor, setUserColor] = useState(currentUser.color);

  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseAnonKey(config.anonKey);
    setUserName(currentUser.name);
    setUserColor(currentUser.color);
  }, [isOpen, currentUser]);

  // Render QR code whenever modal opens with valid config
  useEffect(() => {
    if (isOpen && supabaseUrl && supabaseAnonKey && qrCanvasRef.current) {
      const link = generateConnectionLink({ url: supabaseUrl, anonKey: supabaseAnonKey });
      if (link) {
        QRCode.toCanvas(qrCanvasRef.current, link, {
          width: 160,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        }).catch((err) => console.error('QR code generation error:', err));
      }
    }
  }, [isOpen, supabaseUrl, supabaseAnonKey]);

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

  const handleCopyLink = () => {
    const link = generateConnectionLink({ url: supabaseUrl, anonKey: supabaseAnonKey });
    if (link) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const link = generateConnectionLink({ url: supabaseUrl, anonKey: supabaseAnonKey });
    if (link && navigator.share) {
      try {
        await navigator.share({
          title: 'Jedálniček prepojenie',
          text: 'Pripoj sa k nášmu spoločnému jedálničku pre dvoch:',
          url: link,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
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
      className="app-modal-settings backdrop:bg-black/80 backdrop:backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header - safe below notch */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-[#27272a] bg-[#141417] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Nastavenia & Synchronizácia</h2>
            <p className="text-xs text-zinc-400">Súkromná databáza pre dvoch používateľov</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Zatvoriť"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Connection Status Banner */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                  syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <div>
              <div className="text-sm font-bold text-zinc-100">
                {syncStatus === 'connected'
                  ? 'Pripojené k vašej Supabase Cloud DB'
                  : syncStatus === 'local'
                  ? 'Lokálny režim (Zatiaľ bez Supabase)'
                  : 'Pripája sa k serveru...'}
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                {activeUsers.length} aktívny{activeUsers.length === 1 ? '' : 'ch'} používateľ{activeUsers.length === 1 ? '' : 'ia'} online
              </div>
            </div>
          </div>

          <div className="flex items-center -space-x-2">
            {activeUsers.map((u) => (
              <div
                key={u.id}
                style={{ backgroundColor: u.color }}
                className="w-8 h-8 rounded-full border-2 border-[#18181b] flex items-center justify-center text-xs font-bold text-white shadow-md"
                title={`${u.name} (online)`}
              >
                {u.name ? u.name.charAt(0).toUpperCase() : '?'}
              </div>
            ))}
          </div>
        </div>

        {/* 🔒 Súkromie info box (Option 4) */}
        <div className="p-3.5 bg-[#121215] border border-blue-500/30 rounded-xl text-xs text-zinc-300 leading-relaxed flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Súkromná databáza pre váš pár:</strong>
            Verejná webová adresa na Netlify neobsahuje žiadne databázové kľúče. Cudzí návštevníci vidia iba demo. K vašim jedlám máte prístup výhradne vy a partnerka cez tento QR kód alebo zadané údaje.
          </div>
        </div>

        {/* 📱 Partner Quick Connect via QR code or Link */}
        {supabaseUrl && supabaseAnonKey && (
          <div className="p-4 bg-gradient-to-br from-[#161d2b] to-[#141417] border border-blue-500/40 rounded-xl space-y-3.5 shadow-md">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Prepojenie s partnerom (1 klik / QR kód)</h3>
                <p className="text-xs text-zinc-300">
                  Partnerka nemusí nič opisovať ani manuálne konfigurovať.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0d0d11] p-3 rounded-xl border border-zinc-800">
              {/* High-contrast QR canvas */}
              <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                <canvas ref={qrCanvasRef} className="w-36 h-36 block" />
              </div>

              <div className="flex-1 space-y-2.5 text-center sm:text-left">
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>1. Fotoaparát:</strong> Partnerka namieri fotoaparát svojho mobilu na tento QR kód a ťukne na odkaz.<br />
                  <strong>2. Alebo odkaz:</strong> Pošlite jej odkaz priamo na WhatsApp alebo SMS:
                </p>

                <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Odkaz skopírovaný!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Kopírovať odkaz pre partnerku</span>
                      </>
                    )}
                  </button>

                  {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold border border-zinc-700 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Zdieľať (WhatsApp/SMS)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4 p-4 bg-[#141417] border border-[#27272a] rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Môj profil v aplikácii</span>
          </div>

          <div className="flex items-center gap-3.5">
            <div
              style={{ backgroundColor: userColor }}
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-inner shrink-0"
            >
              {userName ? userName.charAt(0).toUpperCase() : '?'}
            </div>

            <div className="flex-1">
              <label className="block text-xs font-medium text-zinc-300 mb-1">Meno / Prezývka</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="napr. Tomo alebo Zuzka"
                className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">Farba avatara</label>
            <div className="flex items-center gap-2.5">
              {colorPresets.map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setUserColor(preset.val)}
                  style={{ backgroundColor: preset.val }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    userColor === preset.val ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={preset.label}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Uložiť profil
          </button>
        </form>

        {/* Supabase Configuration Form */}
        <form onSubmit={handleSaveSupabase} className="space-y-4 p-4 bg-[#141417] border border-[#27272a] rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Supabase Cloud (pre 2 telefóny)</span>
            </div>
            {supabaseUrl && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Nastavené
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Sem vložte údaje z vášho projektu na Supabase (Settings → API):
          </p>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Project URL</label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Anon / Public API Key</label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full bg-[#18181b] border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
          </div>

          <div className="flex gap-2.5">
            <button
              type="submit"
              disabled={!supabaseUrl.trim() || !supabaseAnonKey.trim()}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Uložiť & Prepojiť</span>
            </button>

            {supabaseUrl && (
              <button
                type="button"
                onClick={handleClearSupabase}
                className="px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-xl"
              >
                Odpojiť
              </button>
            )}
          </div>
        </form>

        {/* Supabase SQL Instructions */}
        <div className="p-4 bg-[#121215] border border-[#27272a] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">SQL príkaz pre Supabase:</span>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Skopírované!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Kopírovať SQL</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            V Supabase prejdite do <strong>SQL Editor</strong>, vložte kód a kliknite na <strong>RUN</strong>.
          </p>
          <pre className="bg-[#18181b] p-2.5 rounded-lg text-[10px] text-zinc-400 font-mono overflow-x-auto max-h-24 no-scrollbar border border-zinc-800">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>

        {saveSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center">
            Nastavenia boli úspešne uložené!
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-[#27272a] bg-[#141417] flex justify-end shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          Zatvoriť
        </button>
      </div>
    </dialog>
  );
};
