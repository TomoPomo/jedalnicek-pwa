import { useState, useEffect, useRef, useCallback } from 'react';
import { WeekPlan, DayKey, MealType } from '../types';
import { syncManager } from '../services/syncManager';
import { createSampleWeek, createEmptyDays } from '../utils/defaultData';

export function useMealPlan(weekId: string) {
  const [plan, setPlan] = useState<WeekPlan>(() => {
    const existing = syncManager.getWeek(weekId);
    // If it's empty on very first load of current week, initialize with sample data
    const isTotallyEmpty = Object.values(existing.days).every(
      (d) => !d.breakfast && !d.lunch && !d.dinner
    );
    if (isTotallyEmpty) {
      const sample = createSampleWeek(weekId);
      syncManager.saveWeek(sample);
      return sample;
    }
    return existing;
  });

  const [isSaving, setIsSaving] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);
  const pendingPlanRef = useRef<WeekPlan>(plan);

  useEffect(() => {
    pendingPlanRef.current = plan;
  }, [plan]);

  useEffect(() => {
    // Subscribe to external/remote updates
    const unsubscribe = syncManager.subscribeWeek(weekId, (remotePlan) => {
      setPlan(remotePlan);
      pendingPlanRef.current = remotePlan;
    });

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [weekId]);

  // Update a single meal slot with optional debounce (default 300ms, or 0ms for instant)
  const updateMeal = useCallback(
    (day: DayKey, mealType: MealType, text: string, immediate = false) => {
      const currentDays = pendingPlanRef.current.days;
      const updatedDays = {
        ...currentDays,
        [day]: {
          ...currentDays[day],
          [mealType]: text,
        },
      };

      const updatedPlan: WeekPlan = {
        ...pendingPlanRef.current,
        id: weekId,
        days: updatedDays,
      };

      // Optimistic state update immediately
      setPlan(updatedPlan);
      pendingPlanRef.current = updatedPlan;

      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      if (immediate) {
        setIsSaving(true);
        syncManager.saveWeek(updatedPlan).finally(() => setIsSaving(false));
      } else {
        setIsSaving(true);
        debounceTimerRef.current = window.setTimeout(() => {
          syncManager.saveWeek(pendingPlanRef.current).finally(() => {
            setIsSaving(false);
          });
        }, 300);
      }
    },
    [weekId]
  );

  // Copy entire plan to target week
  const copyToWeek = useCallback(
    async (targetWeekId: string) => {
      setIsSaving(true);
      const targetPlan: WeekPlan = {
        id: targetWeekId,
        days: JSON.parse(JSON.stringify(pendingPlanRef.current.days)),
        updated_at: new Date().toISOString(),
      };
      await syncManager.saveWeek(targetPlan);
      setIsSaving(false);
      return targetPlan;
    },
    []
  );

  // Clear current week
  const clearWeek = useCallback(async () => {
    setIsSaving(true);
    const clearedPlan: WeekPlan = {
      id: weekId,
      days: createEmptyDays(),
      updated_at: new Date().toISOString(),
    };
    await syncManager.saveWeek(clearedPlan);
    setPlan(clearedPlan);
    pendingPlanRef.current = clearedPlan;
    setIsSaving(false);
  }, [weekId]);

  return {
    plan,
    isSaving,
    updateMeal,
    copyToWeek,
    clearWeek,
  };
}
