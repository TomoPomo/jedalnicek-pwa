import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PenSquare,
  BookOpen,
  Settings,
  Sparkles,
  Calendar,
  Utensils,
  Coffee,
  Moon,
} from 'lucide-react';
import { WeekPlan, DayKey, MealType } from '../types';
import { getDaysForWeek, formatWeekRange, getISOWeekInfo, shiftWeekId } from '../utils/dateUtils';
import { SyncStatus, PresenceUser } from '../services/syncManager';

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
}) => {
  const { weekNumber, rangeStr } = formatWeekRange(currentWeekId);
  const thisWeekId = getISOWeekInfo(new Date()).weekId;
  const isThisWeek = currentWeekId === thisWeekId;
  const daysInfo = getDaysForWeek(currentWeekId);

  // Helper to split multi-component dishes (e.g. "Mäso + Ryža + Šalát")
  const renderDishComponents = (text: string) => {
    if (!text || !text.trim()) return null;
    const parts = text.split('+').map((p) => p.trim()).filter(Boolean);
    if (parts.length <= 1) {
      return <span>{text}</span>;
    }
    return (
      <span className="inline-flex flex-wrap items-center gap-1.5">
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-[#b39268] font-bold text-xs">✦</span>}
            <span>{part}</span>
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#f7f1e5] text-[#2c1f14] overflow-hidden select-none">
      {/* Top Navigation & Status Bar */}
      <header className="shrink-0 bg-[#fbf8f1] border-b border-[#e5d8c3] px-3 sm:px-6 py-2.5 shadow-xs pt-safe">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#3e2c1e] text-[#f4ecd8] flex items-center justify-center shadow-sm">
              <Utensils className="w-4 h-4 text-[#e8c894]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base sm:text-lg tracking-tight text-[#2b1d12]">
                  Týždenné Menu
                </span>
                {isSaving && (
                  <span className="text-[11px] font-sans text-amber-700 animate-pulse flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                    ukladám...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Week Switcher in Navbar */}
          <div className="flex items-center gap-1 bg-[#ede3cf] border border-[#d9cca8] rounded-full p-0.5 px-1 shadow-xs">
            <button
              type="button"
              onClick={() => onChangeWeek(shiftWeekId(currentWeekId, -1))}
              className="p-1 rounded-full text-[#5c4632] hover:text-[#24170d] hover:bg-[#dfd1b8] transition-colors"
              title="Predchádzajúci týždeň"
              aria-label="Predchádzajúci týždeň"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-serif text-xs sm:text-sm font-semibold text-[#2c1d11] px-1.5 sm:px-2.5 whitespace-nowrap">
              {weekNumber}. týždeň
              <span className="hidden md:inline font-sans font-normal text-xs text-[#70563e] ml-1.5">
                ({rangeStr})
              </span>
            </span>

            <button
              type="button"
              onClick={() => onChangeWeek(shiftWeekId(currentWeekId, 1))}
              className="p-1 rounded-full text-[#5c4632] hover:text-[#24170d] hover:bg-[#dfd1b8] transition-colors"
              title="Nasledujúci týždeň"
              aria-label="Nasledujúci týždeň"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actions & Big Edit Button */}
          <div className="flex items-center gap-2">
            {!isThisWeek && (
              <button
                type="button"
                onClick={() => onChangeWeek(thisWeekId)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#ebdcc4] hover:bg-[#dfd0b5] text-[#4a3523] text-xs font-serif font-medium border border-[#d7c4a3] transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#916533]" />
                <span>Tento týždeň</span>
              </button>
            )}

            {/* Sync Badge */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-[#f0e7d5] border border-[#decfae] text-[11px] font-sans font-medium text-[#5c442c]"
              title="Stav synchronizácie & aktívni partneri"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'connected' || syncStatus === 'local' ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              />
              <span className="text-[10px]">
                {syncStatus === 'connected' ? 'Sync' : syncStatus === 'local' ? 'Lokálny' : 'Pripája'}
              </span>
              {activeUsers.length > 0 && (
                <span className="ml-0.5 px-1 py-0.2 bg-[#dfd0b5] rounded-full text-[9px] font-bold text-[#3d2c1c]">
                  {activeUsers.length}
                </span>
              )}
            </button>

            {/* Catalog Button */}
            <button
              type="button"
              onClick={onOpenCatalog}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-full bg-[#ede3cf] hover:bg-[#e0d3ba] text-[#4a3523] border border-[#d9cca8] text-xs font-serif flex items-center gap-1.5 transition-colors"
              title="Knižnica obľúbených receptov"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#916533]" />
              <span className="hidden sm:inline font-sans text-xs font-medium">Recepty</span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="p-1.5 rounded-full bg-[#ede3cf] hover:bg-[#e0d3ba] text-[#5c4632] border border-[#d9cca8] transition-colors"
              title="Nastavenia"
              aria-label="Nastavenia"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* PRIMARY CALL TO ACTION: Editovať plán */}
            <button
              type="button"
              onClick={() => onOpenEditor()}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#3e2c1e] to-[#5a3f2b] hover:from-[#2e2015] hover:to-[#4a3322] text-[#fdf8f0] shadow-sm hover:shadow-md transition-all active:scale-95 text-xs sm:text-sm font-serif font-semibold border border-[#2b1e14]"
              title="Prepnúť do plánovača a upraviť jedlá"
            >
              <PenSquare className="w-3.5 h-3.5 text-[#e5be82]" />
              <span>Editovať plán</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrollable Restaurant Blackboard / Paper Menu Board */}
      <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          {/* Restaurant Menu Ornamental Hero Banner */}
          <div className="text-center relative py-4 sm:py-6 px-4 bg-gradient-to-b from-[#fdfbf6] to-[#f8f2e4] rounded-2xl border border-[#e2d4bd] shadow-xs">
            {/* Small top vintage tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eee3cb] border border-[#d9cca8] text-[11px] uppercase tracking-widest text-[#735538] font-sans font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-[#b3853d]" />
              <span>Domáce Bistro & Jedálny lístok</span>
              <Sparkles className="w-3 h-3 text-[#b3853d]" />
            </div>

            {/* Big Restaurant Serif Title */}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#281b10] mb-1">
              Týždenné Menu
            </h1>

            {/* Subtitle with date range */}
            <p className="font-bistro italic text-lg sm:text-2xl text-[#6b523b]">
              {weekNumber}. týždeň &bull; {rangeStr}
            </p>

            {/* Decorative Divider Line */}
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="h-px w-16 sm:w-28 bg-[#d8c9af]" />
              <span className="text-[#a47b42] text-sm font-serif">❦</span>
              <span className="h-px w-16 sm:w-28 bg-[#d8c9af]" />
            </div>
          </div>

          {/* 7 Days Grid / Restaurant Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 pb-16">
            {daysInfo.map((day) => {
              const meals = plan.days[day.key] || { breakfast: '', lunch: '', dinner: '' };
              const hasMeals = !!(meals.breakfast || meals.lunch || meals.dinner);

              return (
                <div
                  key={day.key}
                  className={`group relative flex flex-col bg-[#fffefb] rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                    day.isToday
                      ? 'border-[#b58641] ring-2 ring-[#b58641]/25 bg-gradient-to-b from-[#fffefc] to-[#fcf6ea]'
                      : day.isWeekend
                      ? 'border-[#e4d6bf] bg-gradient-to-b from-[#fffefc] to-[#f9f4ea]'
                      : 'border-[#e8decb]'
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`px-4 py-3 flex items-center justify-between border-b ${
                      day.isToday
                        ? 'bg-[#f7eedc] border-[#e0cfb0]'
                        : 'bg-[#faf4e6] border-[#ebe0cd]'
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2a1d12] tracking-tight">
                        {day.fullLabel}
                      </h2>
                      <span className="font-bistro italic text-sm text-[#7e644d]">
                        {day.dateStr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {day.isToday && (
                        <span className="px-2 py-0.5 rounded-full bg-[#8c5922] text-[#fffdf8] text-[10px] font-sans font-bold tracking-wider uppercase shadow-xs">
                          Dnes
                        </span>
                      )}
                      {day.isWeekend && !day.isToday && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#eee1c8] text-[#7d5e3f] text-[10px] font-sans font-semibold">
                          Víkend
                        </span>
                      )}

                      {/* Quick Edit icon on card hover/click */}
                      <button
                        type="button"
                        onClick={() => onOpenEditor(day.key)}
                        className="opacity-70 group-hover:opacity-100 p-1 rounded-md text-[#785b40] hover:text-[#2c1c0f] hover:bg-[#ebdcc3] transition-all"
                        title={`Upraviť plán na ${day.fullLabel}`}
                        aria-label={`Upraviť plán na ${day.fullLabel}`}
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Meals Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3.5">
                    {/* 1. Raňajky */}
                    <div
                      onClick={() => onOpenEditor(day.key, 'breakfast')}
                      className="cursor-pointer group/meal rounded-lg p-1.5 -mx-1.5 hover:bg-[#f6eedd] transition-colors"
                      title="Kliknite pre úpravu raňajok"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans font-bold tracking-widest text-[#a66f35] uppercase mb-0.5">
                        <Coffee className="w-3 h-3 text-[#b3853d]" />
                        <span>Raňajky</span>
                      </div>
                      <div className="font-serif text-sm sm:text-base text-[#38281b] leading-relaxed pl-4 border-l-2 border-[#e6d7be] group-hover/meal:border-[#b88c4d] transition-colors">
                        {meals.breakfast ? (
                          renderDishComponents(meals.breakfast)
                        ) : (
                          <span className="font-bistro italic text-[#9c846e] text-sm">
                            — voľný výber —
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Obed (The highlight / hero meal) */}
                    <div
                      onClick={() => onOpenEditor(day.key, 'lunch')}
                      className="cursor-pointer group/meal rounded-xl p-3 bg-gradient-to-br from-[#faf4e6] to-[#f4ecd8] border border-[#e5d4b8] group-hover/meal:border-[#c59a58] transition-all shadow-2xs"
                      title="Kliknite pre úpravu obeda"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-sans font-bold tracking-wider text-[#7a4913] uppercase">
                          <Utensils className="w-3.5 h-3.5 text-[#9e692a]" />
                          <span>Obed &bull; Hlavné jedlo</span>
                        </div>
                        <span className="text-[10px] text-[#9c7546] font-serif italic">
                          menu
                        </span>
                      </div>
                      <div className="font-serif text-base sm:text-lg font-bold text-[#1f140a] leading-snug">
                        {meals.lunch ? (
                          renderDishComponents(meals.lunch)
                        ) : (
                          <span className="font-bistro italic font-normal text-[#9c846e] text-base">
                            — ešte nenaplánované —
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3. Večera */}
                    <div
                      onClick={() => onOpenEditor(day.key, 'dinner')}
                      className="cursor-pointer group/meal rounded-lg p-1.5 -mx-1.5 hover:bg-[#f6eedd] transition-colors"
                      title="Kliknite pre úpravu večere"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-sans font-bold tracking-widest text-[#a66f35] uppercase mb-0.5">
                        <Moon className="w-3 h-3 text-[#b3853d]" />
                        <span>Večera</span>
                      </div>
                      <div className="font-serif text-sm sm:text-base text-[#38281b] leading-relaxed pl-4 border-l-2 border-[#e6d7be] group-hover/meal:border-[#b88c4d] transition-colors">
                        {meals.dinner ? (
                          renderDishComponents(meals.dinner)
                        ) : (
                          <span className="font-bistro italic text-[#9c846e] text-sm">
                            — ľahká večera —
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick indicator if completely empty */}
                    {!hasMeals && (
                      <div className="text-center pt-1 border-t border-dashed border-[#ecdcc5]">
                        <button
                          type="button"
                          onClick={() => onOpenEditor(day.key)}
                          className="font-serif italic text-xs text-[#9c7850] hover:text-[#523b20] underline decoration-[#cdbca0] transition-colors"
                        >
                          + Pridať jedlá na tento deň
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Floating Action Button (Convenient on Mobile) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => onOpenEditor()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#362417] text-[#fffdf7] hover:bg-[#25170d] shadow-lg hover:shadow-xl border border-[#523924] transition-all transform active:scale-95 font-serif font-semibold text-sm tracking-wide"
        >
          <PenSquare className="w-4 h-4 text-[#e5be82]" />
          <span>Editovať plán jedálnička</span>
        </button>
      </div>
    </div>
  );
};
