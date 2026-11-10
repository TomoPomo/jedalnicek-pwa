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

  // Local draft states
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');

  // Suggestions state
  const [activeSuggestionField, setActiveSuggestionField] = useState<MealType | null>(null);
  const [suggestions, setSuggestions] = useState<Dish[]>([]);

  // Sync incoming meals into local state
  useEffect(() => {
    if (meals) {
      setBreakfast(meals.breakfast || '');
      setLunch(meals.lunch || '');
      setDinner(meals.dinner || '');
    }
    setActiveSuggestionField(null);
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

  // Handle escape
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

  const handleFieldChange = (mealType: MealType, value: string) => {
    if (mealType === 'breakfast') setBreakfast(value);
    if (mealType === 'lunch') setLunch(value);
    if (mealType === 'dinner') setDinner(value);

    // Save immediately
    onUpdateMeal(dayKey, mealType, value, false);

    // Update suggestions
    if (value.trim().length >= 2) {
      setActiveSuggestionField(mealType);
      setSuggestions(getSuggestions(value, 4));
    } else {
      setActiveSuggestionField(null);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (mealType: MealType, dishName: string) => {
    if (mealType === 'breakfast') setBreakfast(dishName);
    if (mealType === 'lunch') setLunch(dishName);
    if (mealType === 'dinner') setDinner(dishName);

    onUpdateMeal(dayKey, mealType, dishName, true);
    setActiveSuggestionField(null);
    setSuggestions([]);
  };

  const handleClearField = (mealType: MealType) => {
    handleFieldChange(mealType, '');
    onUpdateMeal(dayKey, mealType, '', true);
    setActiveSuggestionField(null);
  };

  const mealConfigs: Array<{
    type: MealType;
    label: string;
    badge: string;
    badgeClass: string;
    textClass: string;
    value: string;
    placeholder: string;
  }> = [
    {
      type: 'breakfast',
      label: 'Raňajky',
      badge: 'R',
      badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
      textClass: 'text-amber-800',
      value: breakfast,
      placeholder: 'Zadajte raňajky (napr. Ovsená kaša, Vajíčka...)',
    },
    {
      type: 'lunch',
      label: 'Obed',
      badge: 'O',
      badgeClass: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
      textClass: 'text-blue-800',
      value: lunch,
      placeholder: 'Zadajte obed (napr. Kuracie prsia + Ryža...)',
    },
    {
      type: 'dinner',
      label: 'Večera',
      badge: 'V',
      badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
      textClass: 'text-emerald-800',
      value: dinner,
      placeholder: 'Zadajte večeru (napr. Grécky šalát, Tuniak...)',
    },
  ];

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto bg-white text-slate-900 border border-slate-200 rounded-2xl p-0 max-w-lg w-[94%] shadow-2xl backdrop:bg-slate-900/45 backdrop:backdrop-blur-sm z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
    >
      {/* Modal Header */}
      <div className="px-4 py-3 bg-[#fbf7f0] border-b border-[#e5d8c3] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2e1f13] text-[#fbf6ee] flex items-center justify-center shadow-xs">
            <Calendar className="w-4 h-4 text-[#e8c894]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">
              {dayName} <span className="font-mono text-sm text-[#78614a] font-normal">({dateStr})</span>
            </h2>
            <p className="text-xs text-slate-500">Úprava jedálnička na tento deň</p>
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

      {/* 3 Meal Edit Rows */}
      <div className="p-4 sm:p-5 space-y-4 bg-slate-50/30">
        {mealConfigs.map((cfg) => {
          const isSuggesting = activeSuggestionField === cfg.type && suggestions.length > 0;

          return (
            <div key={cfg.type} className="relative bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              {/* Row Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold border ${cfg.badgeClass}`}
                  >
                    {cfg.badge}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-wider ${cfg.textClass}`}>
                    {cfg.label}
                  </span>
                </div>

                {/* Button to open Catalog / Bottom Sheet picker */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBottomSheet(dayKey, cfg.type);
                  }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
                  title="Vybrať z knižnice jedál alebo vyskladať"
                >
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span>Knižnica</span>
                </button>
              </div>

              {/* Input field with Clear button */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={cfg.value}
                  onChange={(e) => handleFieldChange(cfg.type, e.target.value)}
                  placeholder={cfg.placeholder}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 pr-8 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
                />
                {cfg.value && (
                  <button
                    type="button"
                    onClick={() => handleClearField(cfg.type)}
                    className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Vymazať"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Autocomplete suggestion drop */}
              {isSuggesting && (
                <div className="absolute left-3 right-3 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 overflow-hidden">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Návrhy z knižnice:
                  </div>
                  {suggestions.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(cfg.type, dish.name)}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-800 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between transition-colors"
                    >
                      <span className="font-medium">{dish.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Vybrať</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Footer */}
      <div className="px-4 py-3 bg-[#fbf7f0] border-t border-[#e5d8c3] flex items-center justify-between">
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
