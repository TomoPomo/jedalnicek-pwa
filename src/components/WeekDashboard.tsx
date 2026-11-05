import React from 'react';
import { WeekPlan, DayKey, MealType, Dish } from '../types';
import { getDaysForWeek } from '../utils/dateUtils';
import { DayCard } from './DayCard';

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

  return (
    <main className="flex-1 min-h-0 p-1 sm:p-2 overflow-y-auto no-scrollbar flex flex-col">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-7 gap-1 h-full min-h-0">
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
    </main>
  );
};
