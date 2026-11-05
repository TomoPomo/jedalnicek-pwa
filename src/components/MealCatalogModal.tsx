import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Star, Trash2, Utensils, Sparkles, Filter } from 'lucide-react';
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
      className="fixed inset-0 m-auto bg-[#18181b] text-[#f4f4f5] border border-[#27272a] rounded-2xl w-[96vw] max-w-4xl h-[92vh] sm:h-[88vh] shadow-2xl p-0 backdrop:bg-black/80 backdrop:backdrop-blur-md z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-[#27272a] bg-[#141417] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Knižnica jedál a receptov</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                {dishes.length} jedál
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden xs:block">
              Prehľadný zoznam všetkých surovín, príloh a hotových jedál pre týždenný plán
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingOpen(!isAddingOpen)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isAddingOpen
                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nové jedlo</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Zatvoriť"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add New Dish Bar (Expandable or always accessible) */}
      {isAddingOpen && (
        <form
          onSubmit={handleAddDishSubmit}
          className="p-3 sm:p-4 bg-[#121215] border-b border-[#27272a] flex flex-col sm:flex-row gap-2.5 animate-in slide-in-from-top-2 duration-150 shrink-0"
        >
          <div className="flex-1">
            <input
              type="text"
              autoFocus
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              placeholder="Názov jedla (napr. Pečený losos s bylinkovým maslom)..."
              className="w-full bg-[#18181b] border border-blue-500/60 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={newDishCategory}
              onChange={(e) => setNewDishCategory(e.target.value as DishCategory)}
              className="bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:border-blue-500"
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Pridať jedlo</span>
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters Toolbar */}
      <div className="px-4 sm:px-6 pt-3 pb-2.5 bg-[#161619] border-b border-[#27272a] shrink-0 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rýchle vyhľadávanie v receptoch a prílohách..."
            className="w-full bg-[#121212] border border-[#27272a] rounded-xl pl-10 pr-9 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors border ${
              selectedCategory === 'favorites'
                ? 'bg-amber-500 text-black border-amber-400 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-amber-400 border-zinc-700/60'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors border ${
                  isSelected
                    ? `${cat.badgeColor} ${cat.textColor} ${cat.borderColor} ring-1 ring-white/30 shadow-sm`
                    : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-zinc-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className="text-[11px] opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacious Dishes List (2 columns on md+, 1 column on mobile) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5">
        {filteredDishes.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 text-sm flex flex-col items-center justify-center gap-2">
            <Filter className="w-8 h-8 opacity-40 text-zinc-400" />
            <span>{searchQuery ? `Žiadne jedlo nenájdené pre "${searchQuery}"` : 'V tejto kategórii zatiaľ nie sú recepty.'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {filteredDishes.map((dish) => {
              const cat = CATEGORIES.find((c) => c.key === dish.category);
              return (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#141417] hover:bg-[#1a1a20] border border-[#27272a] hover:border-zinc-700 transition-all group shadow-sm"
                >
                  {/* Left: Icon, Name (with smooth floating marquee), Category Badge */}
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                    <span className="text-xl sm:text-2xl shrink-0 p-1 rounded-xl bg-zinc-800/80 border border-zinc-700/50">
                      {cat?.icon || '🍽️'}
                    </span>

                    <div className="flex-1 min-w-0">
                      {/* Floating Marquee text for long meal titles */}
                      <MarqueeText
                        text={dish.name}
                        className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-white"
                      />

                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                            cat?.badgeColor || 'bg-zinc-800'
                          } ${cat?.textColor || 'text-zinc-300'} ${cat?.borderColor || 'border-zinc-700'}`}
                        >
                          {cat?.label}
                        </span>
                        {dish.is_favorite && (
                          <span className="text-[10px] text-amber-400 font-medium flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3" /> Obľúbené
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Favorite & Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(dish.id)}
                      className={`p-2 rounded-xl transition-colors ${
                        dish.is_favorite
                          ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                          : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-800'
                      }`}
                      title={dish.is_favorite ? 'Odstrániť z obľúbených' : 'Označiť ako obľúbené'}
                    >
                      <Star
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          dish.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-zinc-500'
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Naozaj vymazať "${dish.name}" z knižnice?`)) {
                          onDeleteDish(dish.id);
                        }
                      }}
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors opacity-70 group-hover:opacity-100"
                      title="Vymazať jedlo"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-[#27272a] bg-[#141417] flex items-center justify-between text-xs text-zinc-400 shrink-0">
        <div className="flex items-center gap-2">
          <span>
            Zobrazených <strong className="text-white font-mono">{filteredDishes.length}</strong> z{' '}
            <strong className="text-white font-mono">{dishes.length}</strong> jedál
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl font-semibold transition-colors shadow-sm"
        >
          Zatvoriť knižnicu
        </button>
      </div>
    </dialog>
  );
};
