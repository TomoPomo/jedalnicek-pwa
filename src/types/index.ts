export type DishCategory = 
  | 'kuracie'
  | 'hovadzie'
  | 'prilohy'
  | 'oblohy'
  | 'bezmasite'
  | 'dezerty';

export interface Dish {
  id: string;
  name: string;
  category: DishCategory;
  is_favorite?: boolean;
  created_at?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface DayMeals {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export type DayKey = 'po' | 'ut' | 'st' | 'stv' | 'pi' | 'so' | 'ne';

export interface WeekDays {
  po: DayMeals;
  ut: DayMeals;
  st: DayMeals;
  stv: DayMeals;
  pi: DayMeals;
  so: DayMeals;
  ne: DayMeals;
}

export interface WeekPlan {
  id: string; // e.g. "2026-W45"
  days: WeekDays;
  updated_at?: string;
  updated_by?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  color: string;
  lastActive?: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
