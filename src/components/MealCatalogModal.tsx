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
      className="fixed inset-x-0 bottom-2 top-[max(env(safe-area-inset-top,20px),24px)] mx-auto w-[96vw] max-w-4xl max-h-[calc(100dvh-max(env(safe-area-inset-top,20px),24px)-16px)] bg-[#18181b] text-[#f4f4f5] border border-[#27272a] rounded-2xl shadow-2xl p-0 backdrop:bg-black/80 backdrop:backdrop-blur-md z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Compact Header - completely below top notch/status bar */}
      <div className="px-3 py-2 border-b border-[#27272a] bg-[#141417] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Utensils className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white tracking-tight leading-none">Knižnica jedál</h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
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
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>Nové jedlo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
          className="p-2.5 bg-[#121215] border-b border-[#27272a] flex flex-col sm:flex-row gap-2 animate-in slide-in-from-top-2 duration-150 shrink-0"
        >
          <div className="flex-1">
            <input
              type="text"
              autoFocus
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              placeholder="Názov jedla (napr. Pečený losos s bylinkovým maslom)..."
              className="w-full bg-[#18181b] border border-blue-500/60 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={newDishCategory}
              onChange={(e) => setNewDishCategory(e.target.value as DishCategory)}
              className="bg-[#18181b] border border-[#27272a] rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:border-blue-500"
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
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1 shadow-md shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Pridať</span>
            </button>
          </div>
        </form>
      )}

      {/* Compact Search & Category Chips */}
      <div className="px-2.5 pt-2 pb-1.5 bg-[#161619] border-b border-[#27272a] shrink-0 space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Hľadať recept / surovinu..."
            className="w-full bg-[#121212] border border-[#27272a] rounded-lg pl-8 pr-7 py-1 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
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
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-zinc-100 text-black shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60'
            }`}
          >
            Všetky ({dishes.length})
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory('favorites')}
            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-colors border ${
              selectedCategory === 'favorites'
                ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-amber-400 border-zinc-700/60'
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
                    ? `${cat.badgeColor} ${cat.textColor} ${cat.borderColor} ring-1 ring-white/30 shadow-sm`
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
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
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {filteredDishes.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-1">
            <Filter className="w-6 h-6 opacity-40 text-zinc-400" />
            <span>{searchQuery ? `Žiadne jedlo nenájdené pre "${searchQuery}"` : 'V tejto kategórii zatiaľ nie sú recepty.'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {filteredDishes.map((dish) => {
              const cat = CATEGORIES.find((c) => c.key === dish.category);
              return (
                <div
                  key={dish.id}
                  className="flex items-center justify-between h-7 px-2 rounded-md bg-[#151518] hover:bg-[#202026] border border-[#27272a]/70 text-xs transition-colors group"
                >
                  {/* Left: Compact emoji icon + Marquee dish name (single clean line, NO category underneath) */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-1.5">
                    <span className="text-xs shrink-0 select-none">{cat?.icon || '🍽️'}</span>
                    <MarqueeText
                      text={dish.name}
                      className="text-xs font-medium text-zinc-200 group-hover:text-white flex-1 min-w-0"
                    />
                  </div>

                  {/* Right: Favorite Star & Delete */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(dish.id)}
                      className="p-1 rounded text-zinc-500 hover:text-amber-400 transition-colors"
                      title={dish.is_favorite ? 'Odstrániť z obľúbených' : 'Pridať do obľúbených'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          dish.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
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
                      className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors"
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
      <div className="px-3 py-1.5 border-t border-[#27272a] bg-[#141417] flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
        <span>
          Zobrazených: <strong className="text-white font-mono">{filteredDishes.length}</strong> / {dishes.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-md font-semibold text-xs transition-colors"
        >
          Zatvoriť
        </button>
      </div>
    </dialog>
  );
};
