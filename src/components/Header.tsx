import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Trash2,
  BookOpen,
  Settings,
} from 'lucide-react';
import { SyncStatus, PresenceUser } from '../services/syncManager';
import { formatWeekRange, getISOWeekInfo, shiftWeekId } from '../utils/dateUtils';

interface HeaderProps {
  currentWeekId: string;
  isSaving: boolean;
  syncStatus: SyncStatus;
  activeUsers: PresenceUser[];
  onChangeWeek: (weekId: string) => void;
  onOpenCatalog: () => void;
  onOpenSettings: () => void;
  onRequestCopyWeek: () => void;
  onRequestClearWeek: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeekId,
  isSaving,
  syncStatus,
  activeUsers,
  onChangeWeek,
  onOpenCatalog,
  onOpenSettings,
  onRequestCopyWeek,
  onRequestClearWeek,
}) => {
  const { weekNumber, rangeStr } = formatWeekRange(currentWeekId);
  const thisWeekId = getISOWeekInfo(new Date()).weekId;
  const nextWeekId = shiftWeekId(thisWeekId, 1);

  const isCurrentThisWeek = currentWeekId === thisWeekId;
  const isCurrentNextWeek = currentWeekId === nextWeekId;

  return (
    <header className="bg-[#18181b] border-b border-[#27272a] px-2.5 sm:px-4 py-1.5 shrink-0 select-none pt-safe">
      {/* Top Main Row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 via-amber-500 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
            🍽️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">
                Jedálniček
              </h1>
              {isSaving && (
                <span className="text-[10px] text-amber-400 font-medium animate-pulse flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                  ukladám...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Sync Status & Active Users */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#121212] hover:bg-[#202025] border border-[#27272a] transition-colors"
            title="Nastavenia synchronizácie & aktívni používatelia"
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 tracking-tight">
              {syncStatus === 'connected' ? 'Live sync' : syncStatus === 'local' ? 'Lokálny sync' : 'Pripája...'}
            </span>

            {/* Active Users Bubble Count */}
            <div className="flex items-center -space-x-1 ml-0.5">
              {activeUsers.slice(0, 3).map((u) => (
                <div
                  key={u.id}
                  style={{ backgroundColor: u.color }}
                  className="w-4 h-4 rounded-full border border-[#18181b] flex items-center justify-center text-[8px] font-bold text-white"
                  title={`${u.name} (online)`}
                >
                  {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                </div>
              ))}
            </div>
          </button>

          {/* Quick Buttons: Catalog & Settings */}
          <button
            type="button"
            onClick={onOpenCatalog}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
            title="Knižnica jedál"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Knižnica</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Nastavenia"
            title="Nastavenia"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Switcher & Fast Actions Toolbar */}
      <div className="flex items-center justify-between gap-1.5 flex-wrap">
        {/* Week navigation: [◀] Týždeň X [▶] */}
        <div className="flex items-center gap-1 bg-[#121212] border border-[#27272a] rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onChangeWeek(shiftWeekId(currentWeekId, -1))}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            aria-label="Predchádzajúci týždeň"
            title="Predchádzajúci týždeň"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-bold text-zinc-100 px-1 whitespace-nowrap">
            Týždeň {weekNumber}
            <span className="text-[10px] text-zinc-400 font-normal ml-1">({rangeStr})</span>
          </span>

          <button
            type="button"
            onClick={() => onChangeWeek(shiftWeekId(currentWeekId, 1))}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
            aria-label="Nasledujúci týždeň"
            title="Nasledujúci týždeň"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick jump pills */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onChangeWeek(thisWeekId)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
              isCurrentThisWeek
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold'
                : 'bg-zinc-800/70 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tento týždeň
          </button>

          <button
            type="button"
            onClick={() => onChangeWeek(nextWeekId)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors border ${
              isCurrentNextWeek
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-300 font-semibold'
                : 'bg-zinc-800/70 border-zinc-700/60 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Budúci týždeň
          </button>
        </div>

        {/* Action buttons: Copy & Clear */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={onRequestCopyWeek}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors"
            title="Kopírovať aktuálny plán do budúceho týždňa"
          >
            <Copy className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Kopírovať do budúceho</span>
            <span className="sm:hidden">Kopírovať</span>
          </button>

          <button
            type="button"
            onClick={onRequestClearWeek}
            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            title="Vyčistiť tento týždeň"
            aria-label="Vyčistiť týždeň"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
