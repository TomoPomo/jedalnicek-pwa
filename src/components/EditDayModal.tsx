import React, { useState, useEffect, useRef } from 'react';
import { X, BookOpen, Check, Calendar, Utensils } from 'lucide-react';
import { DayKey, DayMeals, MealType, Dish } from '../types';
import { DAY_NAMES, getDaysForWeek } from '../utils/dateUtils';

interface EditDayModalProps {
  isOpen: boolean;
  dayKey: DayKey | null;
  weekId: string;
  meals: DayMeals | null;
  onUpdateMeal: (day: DayKey, mealType: MealType, text: string, immediate?: boolean) => void;
  onOpenBottomSheet: (day: DayKey, mealType: MealType) => void;
  getSuggestions: (query: string, limit?: number) => Dish[];
  onClose: () => void;
}

export const EditDayModal: React.FC<EditDayModalProps> = ({
  isOpen,
  dayKey,
  weekId,
  meals,
  onUpdateMeal,
  onOpenBottomSheet,
  getSuggestions,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Two-line states for Raňajky
  const [breakfastMain, setBreakfastMain] = useState('');
  const [breakfastSnack, setBreakfastSnack] = useState('');

  // Two-line states for Obed (Polievka + Hlavné jedlo)
  const [lunchSoup, setLunchSoup] = useState('');
  const [lunchMain, setLunchMain] = useState('');

  // Two-line states for Večera
  const [dinnerMain, setDinnerMain] = useState('');
  const [dinnerSnack, setDinnerSnack] = useState('');

  // Autocomplete suggestion state
  const [activeInputKey, setActiveInputKey] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Dish[]>([]);

  // Parse incoming meals into 2 lines
  useEffect(() => {
    if (meals) {
      const bParts = (meals.breakfast || '').split('\n');
      setBreakfastMain(bParts[0] || '');
      setBreakfastSnack(bParts[1] || '');

      const lParts = (meals.lunch || '').split('\n');
      setLunchSoup(lParts[0] || '');
      setLunchMain(lParts[1] || '');

      const dParts = (meals.dinner || '').split('\n');
      setDinnerMain(dParts[0] || '');
      setDinnerSnack(dParts[1] || '');
    }
    setActiveInputKey(null);
  }, [meals, isOpen]);

  // Dialog open/close lifecycle
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  // Escape listener
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  if (!isOpen || !dayKey) return null;

  const daysInfo = getDaysForWeek(weekId);
  const currentDayInfo = daysInfo.find((d) => d.key === dayKey);
  const dayName = currentDayInfo ? currentDayInfo.fullLabel : DAY_NAMES[dayKey].full;
  const dateStr = currentDayInfo ? currentDayInfo.dateStr : '';

  const saveBreakfast = (main: string, snack: string) => {
    setBreakfastMain(main);
    setBreakfastSnack(snack);
    const combined = [main.trim(), snack.trim()].filter(Boolean).join('\n');
    onUpdateMeal(dayKey, 'breakfast', combined, false);
  };

  const saveLunch = (soup: string, main: string) => {
    setLunchSoup(soup);
    setLunchMain(main);
    const combined = [soup.trim(), main.trim()].filter(Boolean).join('\n');
    onUpdateMeal(dayKey, 'lunch', combined, false);
  };

  const saveDinner = (main: string, snack: string) => {
    setDinnerMain(main);
    setDinnerSnack(snack);
    const combined = [main.trim(), snack.trim()].filter(Boolean).join('\n');
    onUpdateMeal(dayKey, 'dinner', combined, false);
  };

  const handleInputChange = (fieldKey: string, val: string) => {
    if (fieldKey === 'b_main') saveBreakfast(val, breakfastSnack);
    else if (fieldKey === 'b_snack') saveBreakfast(breakfastMain, val);
    else if (fieldKey === 'l_soup') saveLunch(val, lunchMain);
    else if (fieldKey === 'l_main') saveLunch(lunchSoup, val);
    else if (fieldKey === 'd_main') saveDinner(val, dinnerSnack);
    else if (fieldKey === 'd_snack') saveDinner(dinnerMain, val);

    if (val.trim().length >= 2) {
      setActiveInputKey(fieldKey);
      setSuggestions(getSuggestions(val, 4));
    } else {
      setActiveInputKey(null);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (fieldKey: string, dishName: string) => {
    handleInputChange(fieldKey, dishName);
    setActiveInputKey(null);
    setSuggestions([]);
  };

  return (
    <dialog
      ref={dialogRef}
      className="app-modal-settings animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Modal Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-[#fbf7f0] border-b border-[#e5d8c3] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2e1f13] text-[#fbf6ee] flex items-center justify-center shadow-xs">
            <Calendar className="w-4 h-4 text-[#e8c894]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              {dayName} <span className="font-mono text-sm text-[#78614a] font-normal">({dateStr})</span>
            </h2>
            <p className="text-xs text-slate-500">Úprava jedál, polievok a snackov</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          aria-label="Zavrieť"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Body - 3 Sections (Raňajky, Obed, Večera) each with 2 lines */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
        {/* 1. RAŇAJKY (Raňajky + Desiata / Snack) */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30">
                R
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900">
                Raňajky & Desiata
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBottomSheet(dayKey, 'breakfast');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Vybrať z knižnice receptov"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Knižnica</span>
            </button>
          </div>

          {/* Line 1: Hlavné raňajky */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-950 w-20 shrink-0">1. Raňajky:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={breakfastMain}
                  onChange={(e) => handleInputChange('b_main', e.target.value)}
                  placeholder="napr. Ovsená kaša s ovocím, Vajíčka..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                />
                {breakfastMain && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('b_main', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions dropdown */}
            {activeInputKey === 'b_main' && suggestions.length > 0 && (
              <div className="absolute left-20 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                {suggestions.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('b_main', dish.name)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-slate-800 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between"
                  >
                    <span>{dish.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Vybrať</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Line 2: Desiata / Snack */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-900/80 w-20 shrink-0">2. Desiata:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={breakfastSnack}
                  onChange={(e) => handleInputChange('b_snack', e.target.value)}
                  placeholder="napr. Jablko, proteínový snack, oriešky..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                />
                {breakfastSnack && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('b_snack', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions dropdown */}
            {activeInputKey === 'b_snack' && suggestions.length > 0 && (
              <div className="absolute left-20 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                {suggestions.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('b_snack', dish.name)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-slate-800 hover:bg-amber-50 hover:text-amber-800 flex items-center justify-between"
                  >
                    <span>{dish.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Vybrať</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. OBED (Polievka + Hlavné jedlo) */}
        <div className="bg-white border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold bg-blue-500/15 text-blue-700 border border-blue-500/30">
                O
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-900">
                Obed: Polievka & Hlavné jedlo
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBottomSheet(dayKey, 'lunch');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Vybrať z knižnice receptov"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Knižnica</span>
            </button>
          </div>

          {/* Line 1: Polievka */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-950 w-20 shrink-0">1. Polievka:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lunchSoup}
                  onChange={(e) => handleInputChange('l_soup', e.target.value)}
                  placeholder="napr. Slepačí vývar, Šošovicová, Paradajková..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                />
                {lunchSoup && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('l_soup', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions dropdown */}
            {activeInputKey === 'l_soup' && suggestions.length > 0 && (
              <div className="absolute left-20 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                {suggestions.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('l_soup', dish.name)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between"
                  >
                    <span>{dish.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Vybrať</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Line 2: Hlavné jedlo */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-950 w-20 shrink-0">2. Hlavné:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={lunchMain}
                  onChange={(e) => handleInputChange('l_main', e.target.value)}
                  placeholder="napr. Pečené kuracie stehno + ryža..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs font-medium"
                />
                {lunchMain && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('l_main', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions dropdown */}
            {activeInputKey === 'l_main' && suggestions.length > 0 && (
              <div className="absolute left-20 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                {suggestions.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('l_main', dish.name)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-slate-800 hover:bg-blue-50 hover:text-blue-800 flex items-center justify-between"
                  >
                    <span>{dish.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Vybrať</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. VEČERA */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                V
              </span>
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900">
                Večera & 2. Večera
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenBottomSheet(dayKey, 'dinner');
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
              title="Vybrať z knižnice receptov"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Knižnica</span>
            </button>
          </div>

          {/* Line 1: Hlavná večera */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-950 w-20 shrink-0">1. Večera:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={dinnerMain}
                  onChange={(e) => handleInputChange('d_main', e.target.value)}
                  placeholder="napr. Grécky šalát s feta syrom, Cestoviny..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                />
                {dinnerMain && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('d_main', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions dropdown */}
            {activeInputKey === 'd_main' && suggestions.length > 0 && (
              <div className="absolute left-20 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                {suggestions.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('d_main', dish.name)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center justify-between"
                  >
                    <span>{dish.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Vybrať</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Line 2: 2. večera / snack (voliteľné) */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-900/80 w-20 shrink-0">2. Večera:</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={dinnerSnack}
                  onChange={(e) => handleInputChange('d_snack', e.target.value)}
                  placeholder="napr. Bylinkový čaj, tvaroh, ovocie..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                />
                {dinnerSnack && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('d_snack', '')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Suggestions dropdown */}
            {activeInputKey === 'd_snack' && suggestions.length > 0 && (
              <div className="absolute left-20 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                {suggestions.map((dish) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('d_snack', dish.name)}
                    className="w-full text-left px-3 py-2 text-xs sm:text-sm text-slate-800 hover:bg-emerald-50 hover:text-emerald-800 flex items-center justify-between"
                  >
                    <span>{dish.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Vybrať</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="px-4 py-3 bg-[#fbf7f0] border-t border-[#e5d8c3] flex items-center justify-between shrink-0">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Utensils className="w-3.5 h-3.5 text-[#8f6230]" />
          <span>Zmeny sa ukladajú automaticky</span>
        </span>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#2e1f13] hover:bg-[#1a110a] text-[#fbf6ee] text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Check className="w-3.5 h-3.5 text-[#e8c894]" />
          <span>Hotovo</span>
        </button>
      </div>
    </dialog>
  );
};
