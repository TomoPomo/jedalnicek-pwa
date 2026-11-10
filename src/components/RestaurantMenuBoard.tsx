import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  BookOpen,
  Settings,
  Calendar,
  Lock,
  Unlock,
} from 'lucide-react';
import { WeekPlan, DayKey, MealType, Dish } from '../types';
import { getDaysForWeek, formatWeekRange, getISOWeekInfo, shiftWeekId } from '../utils/dateUtils';
import { SyncStatus, PresenceUser } from '../services/syncManager';
import { MarqueeText } from './MarqueeText';
import { EditDayModal } from './EditDayModal';

interface RestaurantMenuBoardProps {
  plan: WeekPlan;
  currentWeekId: string;
  isSaving: boolean;
  syncStatus: SyncStatus;
  activeUsers: PresenceUser[];
  onChangeWeek: (weekId: string) => void;
  onOpenEditor: (day?: DayKey, meal?: MealType) => void;
  onOpenCatalog: () => void;
  onOpenSettings: () => void;
  onUpdateMeal: (day: DayKey, mealType: MealType, text: string, immediate?: boolean) => void;
  onOpenBottomSheet: (day: DayKey, mealType: MealType) => void;
  getSuggestions: (query: string, limit?: number) => Dish[];
}

export const RestaurantMenuBoard: React.FC<RestaurantMenuBoardProps> = ({
  plan,
  currentWeekId,
  isSaving,
  syncStatus,
  activeUsers,
  onChangeWeek,
  onOpenEditor,
  onOpenCatalog,
  onOpenSettings,
  onUpdateMeal,
  onOpenBottomSheet,
  getSuggestions,
}) => {
  const { weekNumber, rangeStr } = formatWeekRange(currentWeekId);
  const thisWeekId = getISOWeekInfo(new Date()).weekId;
  const isThisWeek = currentWeekId === thisWeekId;
  const daysInfo = getDaysForWeek(currentWeekId);

  // Lock button state: remembers whether editing from the menu board is unlocked
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('jedalnicek_menu_locked');
      return stored !== null ? stored === 'true' : false; // Default to unlocked for immediate convenience
    } catch {
      return false;
    }
  });

  const handleToggleLock = () => {
    const next = !isLocked;
    setIsLocked(next);
    try {
      localStorage.setItem('jedalnicek_menu_locked', String(next));
    } catch (e) {
      console.warn(e);
    }
  };

  // Specific Day Edit Modal state
  const [selectedDayForEdit, setSelectedDayForEdit] = useState<DayKey | null>(null);

  const handleDayClick = (dayKey: DayKey) => {
    if (!isLocked) {
      setSelectedDayForEdit(dayKey);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#f5efe4] text-[#241a12] overflow-hidden select-none font-sans">
      {/* 🧭 Ultra-Compact, Narrow Top Bar (Icons Only) */}
      <header className="shrink-0 bg-[#faf6ee] border-b border-[#e2d5c0] px-2.5 sm:px-4 py-1.5 pt-safe flex items-center justify-between gap-1 shadow-2xs">
        {/* Left: Compact Week Navigation & Date */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-[#eae0cb] border border-[#d5c5a7] rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onChangeWeek(shiftWeekId(currentWeekId, -1))}
              className="p-1 rounded text-[#57422f] hover:text-[#1f160e] hover:bg-[#ded1b6] transition-colors"
              title="Predchádzajúci týždeň"
              aria-label="Predchádzajúci týždeň"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-modern font-bold text-xs sm:text-sm text-[#26190e] px-2 whitespace-nowrap tracking-tight">
              T{weekNumber}
              <span className="text-[11px] font-mono text-[#78614a] font-normal ml-1">
                {rangeStr}
              </span>
            </span>

            <button
              type="button"
              onClick={() => onChangeWeek(shiftWeekId(currentWeekId, 1))}
              className="p-1 rounded text-[#57422f] hover:text-[#1f160e] hover:bg-[#ded1b6] transition-colors"
              title="Nasledujúci týždeň"
              aria-label="Nasledujúci týždeň"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isThisWeek && (
            <button
              type="button"
              onClick={() => onChangeWeek(thisWeekId)}
              className="p-1.5 rounded-lg bg-[#eae0cb] hover:bg-[#ded1b6] text-[#57422f] border border-[#d5c5a7] transition-colors"
              title="Skočiť na tento týždeň"
              aria-label="Tento týždeň"
            >
              <Calendar className="w-3.5 h-3.5 text-[#8f6230]" />
            </button>
          )}

          {isSaving && (
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping ml-1" title="Ukladám..." />
          )}
        </div>

        {/* Right: Icon-only Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* 🔒 LOCK / UNLOCK BUTTON */}
          <button
            type="button"
            onClick={handleToggleLock}
            className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all active:scale-95 shadow-2xs ${
              isLocked
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-emerald-300'
            }`}
            title={
              isLocked
                ? 'Úpravy dňa sú zamknuté (kliknite pre odomknutie)'
                : 'Úpravy dňa sú odomknuté (kliknutím na deň môžete editovať)'
            }
            aria-label={isLocked ? 'Odomknúť úpravy' : 'Zamknúť úpravy'}
          >
            {isLocked ? (
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-800" />
            ) : (
              <Unlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-800" />
            )}
          </button>

          {/* Sync indicator */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#eae0cb] hover:bg-[#ded1b6] border border-[#d5c5a7] text-[#57422f] transition-colors relative"
            title={`Synchronizácia: ${syncStatus} | Aktívni používatelia: ${activeUsers.length}`}
            aria-label="Stav synchronizácie"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'
              }`}
            />
            {activeUsers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#2b1d12] text-[#fbf7ee] rounded-full text-[8px] font-bold flex items-center justify-center">
                {activeUsers.length}
              </span>
            )}
          </button>

          {/* Recipes Catalog Button (Icon only) */}
          <button
            type="button"
            onClick={onOpenCatalog}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#eae0cb] hover:bg-[#ded1b6] text-[#57422f] hover:text-[#1f160e] border border-[#d5c5a7] transition-colors"
            title="Knižnica receptov"
            aria-label="Knižnica receptov"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8f6230]" />
          </button>

          {/* Settings Button (Icon only) */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#eae0cb] hover:bg-[#ded1b6] text-[#57422f] hover:text-[#1f160e] border border-[#d5c5a7] transition-colors"
            title="Nastavenia"
            aria-label="Nastavenia"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* ✏️ MAIN EDIT BUTTON (Switches to full planner) */}
          <button
            type="button"
            onClick={() => onOpenEditor()}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2e1f13] hover:bg-[#1a110a] text-[#fbf6ee] shadow-sm active:scale-95 transition-all border border-[#20150d]"
            title="Prepnúť do plánovača jedálnička"
            aria-label="Plánovač"
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e8c894]" />
          </button>
        </div>
      </header>

      {/* 📱 Mobile Layout (100% on 1 screen without scrolling, 7 rows) */}
      <main className="lg:hidden flex-1 min-h-0 p-1 flex flex-col overflow-hidden">
        <div className="flex-1 grid grid-rows-7 gap-1 h-full min-h-0">
          {daysInfo.map((day) => {
            const meals = plan.days[day.key] || { breakfast: '', lunch: '', dinner: '' };

            return (
              <div
                key={day.key}
                onClick={() => handleDayClick(day.key)}
                className={`min-h-0 flex items-center gap-2 px-2 py-1 rounded-xl border transition-all overflow-hidden ${
                  !isLocked ? 'cursor-pointer hover:border-[#b8853e] hover:shadow-2xs active:scale-[0.995]' : ''
                } ${
                  day.isToday
                    ? 'bg-[#f3e6cf] border-[#c49755] ring-1 ring-[#c49755]/40 shadow-xs'
                    : day.isWeekend
                    ? 'bg-[#fcf7ee] border-[#dfd1bb]'
                    : 'bg-[#fffefc] border-[#e5d7c3]'
                }`}
                title={!isLocked ? `Kliknite pre úpravu dňa: ${day.fullLabel}` : day.fullLabel}
              >
                {/* Day Badge */}
                <div
                  className={`w-12 sm:w-14 shrink-0 h-full flex flex-col items-center justify-center rounded-lg border leading-none py-0.5 ${
                    day.isToday
                      ? 'bg-[#8d5b22] border-[#744917] text-[#fffef9]'
                      : 'bg-[#ede2cd] border-[#d8c8ab] text-[#3d2a19]'
                  }`}
                >
                  <span className="font-modern font-bold text-xs sm:text-sm tracking-wider uppercase">
                    {day.shortLabel}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-mono mt-0.5 ${
                      day.isToday ? 'text-[#f5ecd8]' : 'text-[#755e48]'
                    }`}
                  >
                    {day.dateStr}
                  </span>
                  {day.isToday && (
                    <span className="text-[8px] font-bold uppercase tracking-tight text-[#ffe19c] mt-0.5">
                      Dnes
                    </span>
                  )}
                </div>

                {/* 3 Meals in 1 Compact Row - Larger font, rich text fill */}
                <div className="flex-1 min-w-0 h-full flex flex-col justify-center gap-0.5">
                  {/* R: Raňajky */}
                  <div className="flex items-center gap-1.5 min-w-0 leading-none">
                    <span className="shrink-0 w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                      R
                    </span>
                    <div className="flex-1 min-w-0 text-xs sm:text-sm font-semibold text-[#1e130a]">
                      {meals.breakfast ? (
                        <MarqueeText text={meals.breakfast} speed={25} />
                      ) : (
                        <span className="text-[#9a8570] font-normal italic text-[11px] sm:text-xs">—</span>
                      )}
                    </div>
                  </div>

                  {/* O: Obed */}
                  <div className="flex items-center gap-1.5 min-w-0 leading-none">
                    <span className="shrink-0 w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-blue-500/15 text-blue-700 border border-blue-500/30">
                      O
                    </span>
                    <div className="flex-1 min-w-0 text-xs sm:text-sm font-semibold text-[#1e130a]">
                      {meals.lunch ? (
                        <MarqueeText text={meals.lunch} speed={25} />
                      ) : (
                        <span className="text-[#9a8570] font-normal italic text-[11px] sm:text-xs">—</span>
                      )}
                    </div>
                  </div>

                  {/* V: Večera */}
                  <div className="flex items-center gap-1.5 min-w-0 leading-none">
                    <span className="shrink-0 w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                      V
                    </span>
                    <div className="flex-1 min-w-0 text-xs sm:text-sm font-semibold text-[#1e130a]">
                      {meals.dinner ? (
                        <MarqueeText text={meals.dinner} speed={25} />
                      ) : (
                        <span className="text-[#9a8570] font-normal italic text-[11px] sm:text-xs">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 💻 Desktop / Laptop Layout (Full 7-day columns on 1 screen without scrolling) */}
      <main className="hidden lg:flex flex-1 min-h-0 p-3 flex-col overflow-hidden">
        <div className="flex-1 grid grid-cols-7 gap-2.5 h-full min-h-0">
          {daysInfo.map((day) => {
            const meals = plan.days[day.key] || { breakfast: '', lunch: '', dinner: '' };

            return (
              <div
                key={day.key}
                onClick={() => handleDayClick(day.key)}
                className={`flex flex-col h-full rounded-2xl border overflow-hidden transition-all shadow-2xs ${
                  !isLocked ? 'cursor-pointer hover:border-[#b8853e] hover:shadow-md' : ''
                } ${
                  day.isToday
                    ? 'bg-[#f4e6d0] border-[#b8853e] ring-2 ring-[#b8853e]/30'
                    : day.isWeekend
                    ? 'bg-[#faf4e9] border-[#e2d4be]'
                    : 'bg-[#fffefc] border-[#e6d8c4]'
                }`}
                title={!isLocked ? `Kliknite pre úpravu dňa: ${day.fullLabel}` : day.fullLabel}
              >
                {/* Column Day Header */}
                <div
                  className={`px-3 py-2 border-b flex items-center justify-between shrink-0 ${
                    day.isToday
                      ? 'bg-[#ebd7b9] border-[#d4be99]'
                      : 'bg-[#f8f2e4] border-[#e8dbca]'
                  }`}
                >
                  <div>
                    <div className="font-modern font-bold text-base tracking-wide text-[#281a0e] uppercase">
                      {day.fullLabel}
                    </div>
                    <div className="text-xs font-mono text-[#78614a]">
                      {day.dateStr}
                    </div>
                  </div>
                  {day.isToday && (
                    <span className="px-1.5 py-0.5 rounded bg-[#8f5a20] text-[#fffdfa] text-[10px] font-modern font-bold uppercase tracking-wider">
                      Dnes
                    </span>
                  )}
                </div>

                {/* 3 Meals in Column - Larger font filling the card */}
                <div className="flex-1 min-h-0 p-2.5 flex flex-col justify-between gap-2 overflow-hidden">
                  {/* Raňajky Card */}
                  <div className={`flex-1 min-h-0 flex flex-col justify-center rounded-xl p-2.5 border ${
                    day.isToday ? 'bg-[#faeedd] border-[#dfcfb9]' : 'bg-[#f9f3e7] border-[#ebdcc7]'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4.5 h-4.5 rounded flex items-center justify-center text-xs font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                        R
                      </span>
                      <span className="text-xs font-modern font-bold tracking-wider uppercase text-amber-800">
                        Raňajky
                      </span>
                    </div>
                    <div className="text-sm sm:text-base text-[#1b1107] font-semibold leading-snug">
                      {meals.breakfast ? (
                        <MarqueeText text={meals.breakfast} speed={25} />
                      ) : (
                        <span className="text-[#9a8570] font-normal italic text-xs">—</span>
                      )}
                    </div>
                  </div>

                  {/* Obed Card */}
                  <div className={`flex-1 min-h-0 flex flex-col justify-center rounded-xl p-2.5 border ${
                    day.isToday ? 'bg-[#faeedd] border-[#dfcfb9]' : 'bg-[#f9f3e7] border-[#ebdcc7]'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4.5 h-4.5 rounded flex items-center justify-center text-xs font-bold bg-blue-500/15 text-blue-700 border border-blue-500/30">
                        O
                      </span>
                      <span className="text-xs font-modern font-bold tracking-wider uppercase text-blue-800">
                        Obed
                      </span>
                    </div>
                    <div className="text-sm sm:text-base text-[#1b1107] font-semibold leading-snug">
                      {meals.lunch ? (
                        <MarqueeText text={meals.lunch} speed={25} />
                      ) : (
                        <span className="text-[#9a8570] font-normal italic text-xs">—</span>
                      )}
                    </div>
                  </div>

                  {/* Večera Card */}
                  <div className={`flex-1 min-h-0 flex flex-col justify-center rounded-xl p-2.5 border ${
                    day.isToday ? 'bg-[#faeedd] border-[#dfcfb9]' : 'bg-[#f9f3e7] border-[#ebdcc7]'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-4.5 h-4.5 rounded flex items-center justify-center text-xs font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                        V
                      </span>
                      <span className="text-xs font-modern font-bold tracking-wider uppercase text-emerald-800">
                        Večera
                      </span>
                    </div>
                    <div className="text-sm sm:text-base text-[#1b1107] font-semibold leading-snug">
                      {meals.dinner ? (
                        <MarqueeText text={meals.dinner} speed={25} />
                      ) : (
                        <span className="text-[#9a8570] font-normal italic text-xs">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 📝 Single-Day Edit Modal */}
      {selectedDayForEdit && (
        <EditDayModal
          isOpen={!!selectedDayForEdit}
          dayKey={selectedDayForEdit}
          weekId={currentWeekId}
          meals={plan.days[selectedDayForEdit] || { breakfast: '', lunch: '', dinner: '' }}
          onUpdateMeal={onUpdateMeal}
          onOpenBottomSheet={onOpenBottomSheet}
          getSuggestions={getSuggestions}
          onClose={() => setSelectedDayForEdit(null)}
        />
      )}
    </div>
  );
};
