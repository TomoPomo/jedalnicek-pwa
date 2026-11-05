import React from 'react';
import { DayInfo } from '../utils/dateUtils';
import { WeekPlan, DayKey, MealType, Dish } from '../types';
import { MealSlot } from './MealSlot';

interface DesktopWeekTableProps {
  daysInfo: DayInfo[];
  plan: WeekPlan;
  onUpdateMeal: (day: DayKey, mealType: MealType, text: string, immediate?: boolean) => void;
  onOpenBottomSheet: (day: DayKey, mealType: MealType) => void;
  getSuggestions: (query: string, limit?: number) => Dish[];
}

export const DesktopWeekTable: React.FC<DesktopWeekTableProps> = ({
  daysInfo,
  plan,
  onUpdateMeal,
  onOpenBottomSheet,
  getSuggestions,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-3 sm:py-6">
      {/* Table Header Row */}
      <div className="grid grid-cols-12 gap-3 px-4 py-2 mb-2 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-slate-200 dark:border-[#27272a]">
        <div className="col-span-3 lg:col-span-2">Deň</div>
        <div className="col-span-3 lg:col-span-3 flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
          <span className="w-4 h-4 rounded bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold">
            R
          </span>
          <span>Raňajky</span>
        </div>
        <div className="col-span-3 lg:col-span-4 flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
          <span className="w-4 h-4 rounded bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold">
            O
          </span>
          <span>Obed</span>
        </div>
        <div className="col-span-3 lg:col-span-3 flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400">
          <span className="w-4 h-4 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">
            V
          </span>
          <span>Večera</span>
        </div>
      </div>

      {/* 7 Daily Rows */}
      <div className="space-y-2">
        {daysInfo.map((dayInfo) => {
          const { key, fullLabel, dateStr, isToday, isWeekend } = dayInfo;
          const dayMeals = plan.days[key];

          return (
            <div
              key={key}
              className={`grid grid-cols-12 gap-3 items-center px-4 py-2.5 rounded-xl border transition-all ${
                isToday
                  ? 'bg-blue-50/50 dark:bg-[#1a1c24] border-blue-400 dark:border-blue-500/40 shadow-sm ring-1 ring-blue-500/20'
                  : isWeekend
                  ? 'bg-slate-50/60 dark:bg-[#161619] border-slate-200 dark:border-[#27272a]'
                  : 'bg-white dark:bg-[#18181b] border-slate-200 dark:border-[#27272a] hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm'
              }`}
            >
              {/* Day info column */}
              <div className="col-span-3 lg:col-span-2 flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-bold tracking-tight ${
                        isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : isWeekend
                          ? 'text-slate-600 dark:text-zinc-400'
                          : 'text-slate-900 dark:text-zinc-100'
                      }`}
                    >
                      {fullLabel}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                        Dnes
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-zinc-500 font-mono">{dateStr}</span>
                </div>
              </div>

              {/* Breakfast slot */}
              <div className="col-span-3 lg:col-span-3 p-1.5 rounded-lg bg-slate-50 dark:bg-[#131316] border border-slate-100 dark:border-zinc-800/80">
                <MealSlot
                  mealType="breakfast"
                  value={dayMeals?.breakfast || ''}
                  onChange={(val, immediate) => onUpdateMeal(key, 'breakfast', val, immediate)}
                  onOpenBottomSheet={() => onOpenBottomSheet(key, 'breakfast')}
                  getSuggestions={getSuggestions}
                />
              </div>

              {/* Lunch slot */}
              <div className="col-span-3 lg:col-span-4 p-1.5 rounded-lg bg-slate-50 dark:bg-[#131316] border border-slate-100 dark:border-zinc-800/80">
                <MealSlot
                  mealType="lunch"
                  value={dayMeals?.lunch || ''}
                  onChange={(val, immediate) => onUpdateMeal(key, 'lunch', val, immediate)}
                  onOpenBottomSheet={() => onOpenBottomSheet(key, 'lunch')}
                  getSuggestions={getSuggestions}
                />
              </div>

              {/* Dinner slot */}
              <div className="col-span-3 lg:col-span-3 p-1.5 rounded-lg bg-slate-50 dark:bg-[#131316] border border-slate-100 dark:border-zinc-800/80">
                <MealSlot
                  mealType="dinner"
                  value={dayMeals?.dinner || ''}
                  onChange={(val, immediate) => onUpdateMeal(key, 'dinner', val, immediate)}
                  onOpenBottomSheet={() => onOpenBottomSheet(key, 'dinner')}
                  getSuggestions={getSuggestions}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
