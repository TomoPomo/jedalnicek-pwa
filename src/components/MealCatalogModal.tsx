import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Star, Trash2, Utensils, Filter } from 'lucide-react';
import { Dish, DishCategory } from '../types';
import { CATEGORIES } from '../utils/defaultData';
import { MarqueeText } from './MarqueeText';

interface MealCatalogModalProps {
  isOpen: boolean;
  dishes: Dish[];
  onAddDish: (name: string, category: DishCategory) => Promise<Dish | null>;
  onToggleFavorite: (id: string) => Promise<void>;
  onDeleteDish: (id: string) => Promise<void>;
  onClose: () => void;
}

export const MealCatalogModal: React.FC<MealCatalogModalProps> = ({
  isOpen,
  dishes,
  onAddDish,
  onToggleFavorite,
  onDeleteDish,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newDishName, setNewDishName] = useState('');
  const [newDishCategory, setNewDishCategory] = useState<DishCategory>('kuracie');
  const [isAddingOpen, setIsAddingOpen] = useState(false);

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

  if (!isOpen) return null;

  const handleAddDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim()) return;
    await onAddDish(newDishName.trim(), newDishCategory);
    setNewDishName('');
    setIsAddingOpen(false);
  };

  const filteredDishes = dishes.filter((dish) => {
    if (selectedCategory === 'favorites') {
      if (!dish.is_favorite) return false;
    } else if (selectedCategory !== 'all') {
      if (dish.category !== selectedCategory) return false;
    }

    if (searchQuery.trim()) {
      return dish.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    }
    return true;
  });

  return (
    <dialog
      ref={dialogRef}
      className="app-modal backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150 bg-white text-slate-800 border border-slate-200"
    >
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Knižnica jedál</h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                {dishes.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsAddingOpen(!isAddingOpen)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border ${
              isAddingOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Nové jedlo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Zatvoriť"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add New Dish Bar (collapsible) */}
      {isAddingOpen && (
        <form
          onSubmit={handleAddDishSubmit}
          className="p-2.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-2 animate-in slide-in-from-top-2 duration-150 shrink-0"
        >
          <div className="flex-1">
            <input
              type="text"
              autoFocus
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              placeholder="Názov jedla (napr. Pečený losos s bylinkovým maslom)..."
              className="w-full bg-white border border-blue-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={newDishCategory}
              onChange={(e) => setNewDishCategory(e.target.value as DishCategory)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
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
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-sm shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pridať</span>
            </button>
          </div>
        </form>
      )}

      {/* Compact Search & Category Chips */}
      <div className="px-2.5 pt-2 pb-1.5 bg-slate-50/60 border-b border-slate-200 shrink-0 space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hľadať recept / surovinu..."
            className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Všetky ({dishes.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('favorites')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-colors border ${
              selectedCategory === 'favorites'
                ? 'bg-amber-400 border-amber-500 text-amber-950 font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:text-amber-600'
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
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-colors border ${
                  isSelected
                    ? `${cat.badgeColor} ${cat.textColor} ${cat.borderColor} ring-1 ring-slate-400/30 shadow-2xs font-bold`
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ultra-Dense Compact Dishes List - Fits 20+ meals on screen */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 no-scrollbar bg-slate-50/20">
        {filteredDishes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-1">
            <Filter className="w-6 h-6 opacity-40 text-slate-400" />
            <span>{searchQuery ? `Žiadne jedlo nenájdené pre "${searchQuery}"` : 'V tejto kategórii zatiaľ nie sú recepty.'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {filteredDishes.map((dish) => {
              const cat = CATEGORIES.find((c) => c.key === dish.category);
              return (
                <div
                  key={dish.id}
                  className="flex items-center justify-between h-7 px-2 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-xs transition-colors group shadow-2xs"
                >
                  {/* Left: Compact emoji icon + Marquee dish name */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1.5">
                    <span className="text-xs shrink-0 select-none">{cat?.icon || '🍽️'}</span>
                    <MarqueeText
                      text={dish.name}
                      className="text-xs font-medium text-slate-800 flex-1 min-w-0"
                    />
                  </div>

                  {/* Right: Favorite Star & Delete */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(dish.id)}
                      className="p-1 rounded text-slate-300 hover:text-amber-500 transition-colors"
                      title={dish.is_favorite ? 'Odstrániť z obľúbených' : 'Pridať do obľúbených'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          dish.is_favorite ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Vymazať "${dish.name}"?`)) {
                          onDeleteDish(dish.id);
                        }
                      }}
                      className="p-1 rounded text-slate-300 hover:text-red-500 transition-colors"
                      title="Vymazať jedlo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compact Footer */}
      <div className="px-3 py-1.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span>
          Zobrazených: <strong className="text-slate-800 font-mono">{filteredDishes.length}</strong> / {dishes.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-semibold text-xs transition-colors shadow-2xs"
        >
          Zatvoriť
        </button>
      </div>
    </dialog>
  );
};
