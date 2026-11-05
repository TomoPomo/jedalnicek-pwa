import React from 'react';
import { DayInfo } from '../utils/dateUtils';
import { DayMeals, MealType, Dish, DayKey } from '../types';
import { MealSlot } from './MealSlot';

interface DayCardProps {
  dayInfo: DayInfo;
  meals: DayMeals;
  onUpdateMeal: (day: DayKey, mealType: MealType, text: string, immediate?: boolean) => void;
  onOpenBottomSheet: (day: DayKey, mealType: MealType) => void;
  getSuggestions: (query: string, limit?: number) => Dish[];
}

export const DayCard: React.FC<DayCardProps> = ({
  dayInfo,
  meals,
  onUpdateMeal,
  onOpenBottomSheet,
  getSuggestions,
}) => {
  const { key, shortLabel, fullLabel, dateStr, isToday, isWeekend } = dayInfo;

  return (
    <div
      className={`rounded-xl border transition-all duration-150 flex flex-col justify-between p-1.5 sm:p-2 ${
        isToday
          ? 'bg-[#1a1c23] border-blue-500/40 ring-1 ring-blue-500/30'
          : isWeekend
          ? 'bg-[#161619] border-[#27272a]/80'
          : 'bg-[#18181b] border-[#27272a]'
      }`}
    >
      {/* Day Header Row */}
      <div className="flex items-center justify-between pb-1 mb-0.5 border-b border-[#27272a]/60">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xs font-bold tracking-tight ${
              isToday ? 'text-blue-400' : isWeekend ? 'text-zinc-400' : 'text-zinc-200'
            }`}
          >
            {shortLabel}
          </span>
          <span className="text-[10px] text-zinc-400 font-mono hidden xs:inline">{fullLabel}</span>
          <span className="text-[10px] text-zinc-500 font-mono">({dateStr})</span>
        </div>

        {isToday && (
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Dnes
          </span>
        )}
      </div>

      {/* 3 Compact Meal Rows */}
      <div className="space-y-0.5 flex-1 flex flex-col justify-around">
        <MealSlot
          mealType="breakfast"
          value={meals?.breakfast || ''}
          onChange={(val, immediate) => onUpdateMeal(key, 'breakfast', val, immediate)}
          onOpenBottomSheet={() => onOpenBottomSheet(key, 'breakfast')}
          getSuggestions={getSuggestions}
        />
        <MealSlot
          mealType="lunch"
          value={meals?.lunch || ''}
          onChange={(val, immediate) => onUpdateMeal(key, 'lunch', val, immediate)}
          onOpenBottomSheet={() => onOpenBottomSheet(key, 'lunch')}
          getSuggestions={getSuggestions}
        />
        <MealSlot
          mealType="dinner"
          value={meals?.dinner || ''}
          onChange={(val, immediate) => onUpdateMeal(key, 'dinner', val, immediate)}
          onOpenBottomSheet={() => onOpenBottomSheet(key, 'dinner')}
          getSuggestions={getSuggestions}
        />
      </div>
    </div>
  );
};
