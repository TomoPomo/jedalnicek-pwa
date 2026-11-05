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

export const INITIAL_DISHES: Dish[] = [
  // Kuracie
  { id: 'k1', name: 'Kurací plátok na prírodno', category: 'kuracie', is_favorite: true },
  { id: 'k2', name: 'Kuracie rezne v cestíčku', category: 'kuracie', is_favorite: true },
  { id: 'k3', name: 'Kuracie soté so zeleninou', category: 'kuracie' },
  { id: 'k4', name: 'Pečené kuracie stehná s cesnakom', category: 'kuracie' },
  { id: 'k5', name: 'Kuracie kari s kokosovým mliekom', category: 'kuracie', is_favorite: true },
  { id: 'k6', name: 'Šalát Caesar s grilovaným kuraťom', category: 'kuracie' },
  { id: 'k7', name: 'Kuracie na paprike (paprikáš)', category: 'kuracie' },

  // Hovädzie
  { id: 'h1', name: 'Hovädzí guláš s knedľou', category: 'hovadzie', is_favorite: true },
  { id: 'h2', name: 'Sviečková na smotane', category: 'hovadzie', is_favorite: true },
  { id: 'h3', name: 'Hovädzie na hubách', category: 'hovadzie' },
  { id: 'h4', name: 'Hovädzí burger s cibuľkou', category: 'hovadzie' },
  { id: 'h5', name: 'Bolognese špagety s parmezánom', category: 'hovadzie', is_favorite: true },
  { id: 'h6', name: 'Chilli con carne', category: 'hovadzie' },

  // Prílohy
  { id: 'p1', name: 'Jazmínová ryža', category: 'prilohy', is_favorite: true },
  { id: 'p2', name: 'Pečené zemiaky s rozmarínom', category: 'prilohy', is_favorite: true },
  { id: 'p3', name: 'Zemiaková kaša s maslom', category: 'prilohy', is_favorite: true },
  { id: 'p4', name: 'Domáce hranolky', category: 'prilohy' },
  { id: 'p5', name: 'Parená knedľa', category: 'prilohy' },
  { id: 'p6', name: 'Kuskus so sušenými paradajkami', category: 'prilohy' },
  { id: 'p7', name: 'Bulgur so zeleninou', category: 'prilohy' },
  { id: 'p8', name: 'Cestoviny penne', category: 'prilohy' },

  // Oblohy
  { id: 'o1', name: 'Uhorkový šalát s cesnakom', category: 'oblohy', is_favorite: true },
  { id: 'o2', name: 'Miešaný listový šalát s dresingom', category: 'oblohy', is_favorite: true },
  { id: 'o3', name: 'Paradajkový šalát s cibuľkou', category: 'oblohy' },
  { id: 'o4', name: 'Kyslé uhorky a feferónky', category: 'oblohy' },
  { id: 'o5', name: 'Grilovaná cuketa a paprika', category: 'oblohy' },
  { id: 'o6', name: 'Coleslaw šalát', category: 'oblohy', is_favorite: true },

  // Bezmäsité
  { id: 'b1', name: 'Vyprážaný syr s tatárskou omáčkou', category: 'bezmasite', is_favorite: true },
  { id: 'b2', name: 'Bryndzové halušky so slaninkou', category: 'bezmasite', is_favorite: true },
  { id: 'b3', name: 'Krémové hríbové rizoto', category: 'bezmasite' },
  { id: 'b4', name: 'Tofu stir-fry s brokolicou a teriyaki', category: 'bezmasite' },
  { id: 'b5', name: 'Cícerové kari so špenátom', category: 'bezmasite' },
  { id: 'b6', name: 'Špenátové halušky so syrovou omáčkou', category: 'bezmasite' },
  { id: 'b7', name: 'Zapekaná brokolica so zemiakmi', category: 'bezmasite' },

  // Dezerty
  { id: 'd1', name: 'Domáca jablková štrúdľa', category: 'dezerty', is_favorite: true },
  { id: 'd2', name: 'Tvarohový koláč s ovocím', category: 'dezerty' },
  { id: 'd3', name: 'Palacinky s džemom a nutellou', category: 'dezerty', is_favorite: true },
  { id: 'd4', name: 'Čokoládové brownies s orechmi', category: 'dezerty' },
  { id: 'd5', name: 'Panna Cotta s malinovým prelivom', category: 'dezerty' },
  { id: 'd6', name: 'Krupicová kaša so škoricou a maslom', category: 'dezerty' },
];

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
