import { DayKey } from '../types';

export interface DayInfo {
  key: DayKey;
  shortLabel: string; // 'PO', 'UT', ...
  fullLabel: string;  // 'Pondelok', 'Utorok', ...
  dateStr: string;    // '10. 11.'
  isToday: boolean;
  isWeekend: boolean;
}

/**
 * Returns ISO week number and year for a given Date
 */
export function getISOWeekInfo(d: Date = new Date()): { year: number; week: number; weekId: string } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const year = date.getUTCFullYear();
  const weekId = `${year}-W${weekNo.toString().padStart(2, '0')}`;
  return { year, week: weekNo, weekId };
}

/**
 * Parses weekId ("2026-W45") to Monday of that week
 */
export function getMondayFromWeekId(weekId: string): Date {
  const parts = weekId.split('-W');
  const year = parseInt(parts[0], 10);
  const week = parseInt(parts[1], 10);

  // Jan 4th is always in week 1
  const simple = new Date(year, 0, 4);
  const dayOfWeek = simple.getDay() || 7;
  const mondayWeek1 = new Date(simple);
  mondayWeek1.setDate(simple.getDate() - dayOfWeek + 1);

  const targetMonday = new Date(mondayWeek1);
  targetMonday.setDate(mondayWeek1.getDate() + (week - 1) * 7);
  targetMonday.setHours(0, 0, 0, 0);
  return targetMonday;
}

/**
 * Shifts weekId by offset (+1 for next, -1 for prev)
 */
export function shiftWeekId(weekId: string, offset: number): string {
  const monday = getMondayFromWeekId(weekId);
  monday.setDate(monday.getDate() + offset * 7);
  return getISOWeekInfo(monday).weekId;
}

export const DAY_KEYS: DayKey[] = ['po', 'ut', 'st', 'stv', 'pi', 'so', 'ne'];

export const DAY_NAMES: Record<DayKey, { short: string; full: string }> = {
  po: { short: 'PO', full: 'Pondelok' },
  ut: { short: 'UT', full: 'Utorok' },
  st: { short: 'ST', full: 'Streda' },
  stv: { short: 'ŠT', full: 'Štvrtok' },
  pi: { short: 'PI', full: 'Piatok' },
  so: { short: 'SO', full: 'Sobota' },
  ne: { short: 'NE', full: 'Nedeľa' },
};

/**
 * Returns metadata for all 7 days of the specified week
 */
export function getDaysForWeek(weekId: string): DayInfo[] {
  const monday = getMondayFromWeekId(weekId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return DAY_KEYS.map((key, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    dayDate.setHours(0, 0, 0, 0);

    const isToday = dayDate.getTime() === today.getTime();
    const isWeekend = key === 'so' || key === 'ne';

    const dayOfMonth = dayDate.getDate();
    const month = dayDate.getMonth() + 1;
    const dateStr = `${dayOfMonth}.${month}.`;

    return {
      key,
      shortLabel: DAY_NAMES[key].short,
      fullLabel: DAY_NAMES[key].full,
      dateStr,
      isToday,
      isWeekend,
    };
  });
}

/**
 * Formats weekId into human readable Slovak text e.g. "Týždeň 45 (10.11. – 16.11.)"
 */
export function formatWeekRange(weekId: string): { weekNumber: number; rangeStr: string } {
  const monday = getMondayFromWeekId(weekId);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const parts = weekId.split('-W');
  const weekNumber = parseInt(parts[1], 10);

  const mD = monday.getDate();
  const mM = monday.getMonth() + 1;
  const sD = sunday.getDate();
  const sM = sunday.getMonth() + 1;

  const rangeStr = `${mD}.${mM}. – ${sD}.${sM}.`;
  return { weekNumber, rangeStr };
}
