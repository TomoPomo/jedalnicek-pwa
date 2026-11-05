import React, { useState } from 'react';
import { LayoutGrid, Rows } from 'lucide-react';
import { WeekPlan, DayKey, MealType, Dish } from '../types';
import { getDaysForWeek } from '../utils/dateUtils';
import { DayCard } from './DayCard';
import { DesktopWeekTable } from './DesktopWeekTable';

interface WeekDashboardProps {
  plan: WeekPlan;
  onUpdateMeal: (day: DayKey, mealType: MealType, text: string, immediate?: boolean) => void;
  onOpenBottomSheet: (day: DayKey, mealType: MealType) => void;
  getSuggestions: (query: string, limit?: number) => Dish[];
}

export const WeekDashboard: React.FC<WeekDashboardProps> = ({
  plan,
  onUpdateMeal,
  onOpenBottomSheet,
  getSuggestions,
}) => {
  const daysInfo = getDaysForWeek(plan.id);
  // On desktop: default to 'table' (rows) which solves narrow/tall columns on laptops
  const [desktopView, setDesktopView] = useState<'table' | 'columns'>('table');

  return (
    <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col bg-slate-50 dark:bg-[#121212] transition-colors">
      {/* 📱 Mobile Layout (Full 7-day view on 1 screen) */}
      <div className="lg:hidden flex-1 min-h-0 p-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 gap-1 h-full min-h-0">
          {daysInfo.map((dayInfo) => (
            <DayCard
              key={dayInfo.key}
              dayInfo={dayInfo}
              meals={plan.days[dayInfo.key]}
              onUpdateMeal={onUpdateMeal}
              onOpenBottomSheet={onOpenBottomSheet}
              getSuggestions={getSuggestions}
            />
          ))}
        </div>
      </div>

      {/* 💻 Desktop / Laptop Layout */}
      <div className="hidden lg:block flex-1 min-h-0">
        {/* Desktop View Switcher Toolbar */}
        <div className="max-w-7xl mx-auto px-4 pt-3 flex items-center justify-end">
          <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-200/80 dark:bg-zinc-800/80 border border-slate-300 dark:border-zinc-700/60 text-xs">
            <button
              type="button"
              onClick={() => setDesktopView('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                desktopView === 'table'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
              <span>Riadky (Široká tabuľka)</span>
            </button>

            <button
              type="button"
              onClick={() => setDesktopView('columns')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-colors ${
                desktopView === 'columns'
                  ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Karty (7 stĺpcov)</span>
            </button>
          </div>
        </div>

        {desktopView === 'table' ? (
          <DesktopWeekTable
            daysInfo={daysInfo}
            plan={plan}
            onUpdateMeal={onUpdateMeal}
            onOpenBottomSheet={onOpenBottomSheet}
            getSuggestions={getSuggestions}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-7 gap-2.5">
            {daysInfo.map((dayInfo) => (
              <DayCard
                key={dayInfo.key}
                dayInfo={dayInfo}
                meals={plan.days[dayInfo.key]}
                onUpdateMeal={onUpdateMeal}
                onOpenBottomSheet={onOpenBottomSheet}
                getSuggestions={getSuggestions}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
