import { Dish, DishCategory, WeekPlan, WeekDays } from '../types';

export interface CategoryMeta {
  key: DishCategory;
  label: string;
  badgeColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'kuracie',
    label: 'Kuracie',
    badgeColor: 'bg-amber-500/15',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    icon: '🍗',
  },
  {
    key: 'hovadzie',
    label: 'Hovädzie',
    badgeColor: 'bg-red-500/15',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    icon: '🥩',
  },
  {
    key: 'prilohy',
    label: 'Prílohy',
    badgeColor: 'bg-yellow-500/15',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    icon: '🍚',
  },
  {
    key: 'oblohy',
    label: 'Oblohy',
    badgeColor: 'bg-emerald-500/15',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    icon: '🥗',
  },
  {
    key: 'bezmasite',
    label: 'Bezmäsité',
    badgeColor: 'bg-teal-500/15',
    textColor: 'text-teal-400',
    borderColor: 'border-teal-500/30',
    icon: '🧀',
  },
  {
    key: 'dezerty',
    label: 'Dezerty',
    badgeColor: 'bg-pink-500/15',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    icon: '🍰',
  },
];

export const INITIAL_DISHES: Dish[] = [];

export function createEmptyDays(): WeekDays {
  return {
    po: { breakfast: '', lunch: '', dinner: '' },
    ut: { breakfast: '', lunch: '', dinner: '' },
    st: { breakfast: '', lunch: '', dinner: '' },
    stv: { breakfast: '', lunch: '', dinner: '' },
    pi: { breakfast: '', lunch: '', dinner: '' },
    so: { breakfast: '', lunch: '', dinner: '' },
    ne: { breakfast: '', lunch: '', dinner: '' },
  };
}

export function createEmptyWeek(weekId: string): WeekPlan {
  return {
    id: weekId,
    days: createEmptyDays(),
    updated_at: new Date().toISOString(),
  };
}

export function createSampleWeek(weekId: string): WeekPlan {
  return {
    id: weekId,
    days: {
      po: {
        breakfast: 'Ovsená kaša s ovocím',
        lunch: 'Kurací plátok na prírodno + Jazmínová ryža + Uhorkový šalát',
        dinner: 'Miešaný listový šalát s vajíčkom',
      },
      ut: {
        breakfast: 'Miešané vajíčka s kváskovým chlebom',
        lunch: 'Hovädzí guláš s knedľou',
        dinner: 'Tvarohová nátierka s reďkovkou',
      },
      st: {
        breakfast: 'Biely grécky jogurt, granola a med',
        lunch: 'Bolognese špagety s parmezánom',
        dinner: 'Zeleninový wrap so syrom',
      },
      stv: {
        breakfast: 'Avokádový toast s volským okom',
        lunch: 'Vyprážaný syr + Domáce hranolky + Tatárska',
        dinner: 'Šošovicová polievka s chlebom',
      },
      pi: {
        breakfast: 'Lievance s javorovým sirupom',
        lunch: 'Kuracie kari s kokosovým mliekom + Jazmínová ryža',
        dinner: 'Domáca pizza (šunka, šampiňóny)',
      },
      so: {
        breakfast: 'Vianočka s maslom a džemom',
        lunch: 'Sviečková na smotane + Parená knedľa',
        dinner: 'Palacinky s džemom a nutellou',
      },
      ne: {
        breakfast: 'Nedeľné párky s horčicou a pečivom',
        lunch: 'Pečené kuracie stehná + Zemiaková kaša + Uhorkový šalát',
        dinner: 'Zapekané toasty so šunkou a syrom',
      },
    },
    updated_at: new Date().toISOString(),
  };
}
