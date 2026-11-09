import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Sparkles, Check, Star, Layers, Zap } from 'lucide-react';
import { Dish, DishCategory, DayKey, MealType } from '../types';
import { CATEGORIES } from '../utils/defaultData';
import { DAY_NAMES } from '../utils/dateUtils';
import { MarqueeText } from './MarqueeText';

interface BottomSheetDrawerProps {
  isOpen: boolean;
  dayKey: DayKey | null;
  mealType: MealType | null;
  currentValue: string;
  dishes: Dish[];
  onSelect: (dishName: string) => void;
  onAddDish: (name: string, category: DishCategory) => Promise<Dish | null>;
  onToggleFavorite: (id: string) => Promise<void>;
  onClose: () => void;
}

export const BottomSheetDrawer: React.FC<BottomSheetDrawerProps> = ({
  isOpen,
  dayKey,
  mealType,
  currentValue,
  dishes,
  onSelect,
  onAddDish,
  onToggleFavorite,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposerMode, setIsComposerMode] = useState(false);
  const [composedComponents, setComposedComponents] = useState<string[]>([]);
  
  // Quick add dish inside drawer
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<DishCategory>('kuracie');

  // Sync open state with native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // If current value contains " + ", prefill composer
      if (currentValue && currentValue.includes(' + ')) {
        setComposedComponents(currentValue.split(' + ').map((s) => s.trim()).filter(Boolean));
        setIsComposerMode(true);
      } else {
        setComposedComponents(currentValue ? [currentValue] : []);
        setIsComposerMode(false);
      }
      setSearchQuery('');
      setIsAddingNew(false);
      setNewDishName('');
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen, currentValue]);

  // Esc / cancel listener
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

  if (!isOpen || !dayKey || !mealType) return null;

  const mealLabels: Record<MealType, { label: string; badge: string; color: string; border: string }> = {
    breakfast: { label: 'Raňajky', badge: 'R', color: 'bg-amber-500/15 text-amber-700', border: 'border-amber-500/30' },
    lunch: { label: 'Obed', badge: 'O', color: 'bg-blue-500/15 text-blue-700', border: 'border-blue-500/30' },
    dinner: { label: 'Večera', badge: 'V', color: 'bg-emerald-500/15 text-emerald-700', border: 'border-emerald-500/30' },
  };

  const currentMealMeta = mealLabels[mealType];
  const dayName = DAY_NAMES[dayKey].full;

  // Filter dishes
  const filteredDishes = dishes.filter((dish) => {
    // Category filter
    if (selectedCategory === 'favorites') {
      if (!dish.is_favorite) return false;
    } else if (selectedCategory !== 'all') {
      if (dish.category !== selectedCategory) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      return dish.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }

    return true;
  });

  const handleDishClick = (dishName: string) => {
    if (isComposerMode) {
      if (composedComponents.includes(dishName)) {
        setComposedComponents(composedComponents.filter((c) => c !== dishName));
      } else {
        setComposedComponents([...composedComponents, dishName]);
      }
    } else {
      onSelect(dishName);
      onClose();
    }
  };

  const handleConfirmComposer = () => {
    if (composedComponents.length > 0) {
      onSelect(composedComponents.join(' + '));
    }
    onClose();
  };

  const handleCreateNewDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;

    const created = await onAddDish(newDishName.trim(), newDishCategory);
    if (created) {
      if (isComposerMode) {
        setComposedComponents([...composedComponents, created.name]);
      } else {
        onSelect(created.name);
        onClose();
      }
      setIsAddingNew(false);
      setNewDishName('');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="app-drawer backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm animate-in slide-in-from-bottom duration-200 bg-white text-slate-800 border-t border-slate-200"
    >
      {/* Handle pull bar */}
      <div className="pt-2 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
        <div className="w-10 h-1 bg-slate-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${currentMealMeta.color} ${currentMealMeta.border}`}>
            {currentMealMeta.badge}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 leading-tight">
              {dayName} • {currentMealMeta.label}
            </h2>
            <p className="text-[11px] text-slate-500">
              {isComposerMode ? 'Skladanie z viacerých komponentov' : 'Vyber jedlo zo zoznamu'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Mode switch */}
          <button
            type="button"
            onClick={() => setIsComposerMode(!isComposerMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
              isComposerMode
                ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
            title="Prepnúť režim skladania obeda z viacerých častí"
          >
            {isComposerMode ? <Layers className="w-3.5 h-3.5 text-blue-600" /> : <Zap className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isComposerMode ? 'Skladačka' : '1-klik'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Zatvoriť"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Composer Preview Bar (Visible when in composer mode) */}
      {isComposerMode && (
        <div className="px-4 py-2 bg-blue-50/60 border-b border-blue-200 flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-blue-900 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Vyskladaný obed:</span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
              {composedComponents.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Klikni na jedlá nižšie pre pridanie...</span>
              ) : (
                composedComponents.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-white border border-blue-200 text-slate-800 shadow-2xs"
                  >
                    <span>{comp}</span>
                    <button
                      type="button"
                      onClick={() => setComposedComponents(composedComponents.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={handleConfirmComposer}
            disabled={composedComponents.length === 0}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
              composedComponents.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Použiť</span>
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="px-3 pt-2 pb-1.5 flex items-center gap-2 bg-white">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hľadať jedlo (napr. kuracie, ryža...)"
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-1 shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nové jedlo</span>
        </button>
      </div>

      {/* Quick Add Form Drawer Expansion */}
      {isAddingNew && (
        <form onSubmit={handleCreateNewDish} className="mx-3 my-1 p-2 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">Pridať nové jedlo do knižnice:</span>
            <button type="button" onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              placeholder="Názov jedla (napr. Losos so špargľou)"
              className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <select
              value={newDishCategory}
              onChange={(e) => setNewDishCategory(e.target.value as DishCategory)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newDishName.trim()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium shrink-0"
            >
              Pridať
            </button>
          </div>
        </form>
      )}

      {/* Horizontal Sliding Category Chips */}
      <div className="px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-b border-slate-200 bg-slate-50/50">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
            selectedCategory === 'all'
              ? 'bg-slate-900 border-slate-900 text-white font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          Všetky ({dishes.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('favorites')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-colors border ${
            selectedCategory === 'favorites'
              ? 'bg-amber-400 border-amber-500 text-amber-950 font-semibold'
              : 'bg-white border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300'
          }`}
        >
          <Star className="w-3 h-3 fill-current" />
          <span>Obľúbené</span>
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = dishes.filter((d) => d.category === cat.key).length;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 transition-colors border ${
                isSelected
                  ? `${cat.badgeColor} ${cat.textColor} ${cat.borderColor} font-semibold ring-1 ring-slate-400/30`
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Dishes Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-1 bg-slate-50/30">
        {filteredDishes.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {searchQuery ? `Žiadne jedlo nenájdené pre "${searchQuery}"` : 'V tejto kategórii zatiaľ nie sú jedlá.'}
          </div>
        ) : (
          filteredDishes.map((dish) => {
            const isSelectedInComposer = isComposerMode && composedComponents.includes(dish.name);
            const cat = CATEGORIES.find((c) => c.key === dish.category);

            return (
              <div
                key={dish.id}
                onClick={() => handleDishClick(dish.name)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all active:scale-[0.99] ${
                  isSelectedInComposer
                    ? 'bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500/30 font-semibold'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                  <span className="text-sm shrink-0">{cat?.icon || '🍽️'}</span>
                  <MarqueeText text={dish.name} className="flex-1 min-w-0 font-medium text-xs text-slate-800" />
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(dish.id)}
                    className="p-1 rounded text-slate-300 hover:text-amber-500 transition-colors"
                    title="Označiť ako obľúbené"
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        dish.is_favorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-400'
                      }`}
                    />
                  </button>

                  {isComposerMode ? (
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border text-[11px] ${
                        isSelectedInComposer
                          ? 'bg-blue-600 border-blue-600 text-white font-bold'
                          : 'border-slate-300 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isSelectedInComposer ? <Check className="w-3 h-3" /> : '+'}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 hover:text-blue-600 font-mono">Vybrať ➔</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom quick clear action */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 pb-safe">
        <button
          type="button"
          onClick={() => {
            onSelect('');
            onClose();
          }}
          className="text-red-600 hover:text-red-700 text-[11px] py-1 px-2 font-medium"
        >
          Vymazať toto jedlo
        </button>

        <span className="text-[11px] text-slate-500">
          Spolu v databáze: <strong className="text-slate-700">{dishes.length}</strong>
        </span>
      </div>
    </dialog>
  );
};
