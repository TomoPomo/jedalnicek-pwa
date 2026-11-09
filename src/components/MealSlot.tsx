import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Check, X } from 'lucide-react';
import { MealType, Dish } from '../types';
import { MarqueeText } from './MarqueeText';

interface MealSlotProps {
  mealType: MealType;
  value: string;
  onChange: (val: string, immediate?: boolean) => void;
  onOpenBottomSheet: () => void;
  getSuggestions: (query: string, limit?: number) => Dish[];
}

export const MealSlot: React.FC<MealSlotProps> = ({
  mealType,
  value,
  onChange,
  onOpenBottomSheet,
  getSuggestions,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external changes into local input if not actively typing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(value);
    }
  }, [value, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Handle outside click to close edit mode
  useEffect(() => {
    if (!isEditing) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsEditing(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isEditing]);

  const badgeConfig: Record<MealType, { label: string; badge: string; textClass: string; bgClass: string; borderClass: string }> = {
    breakfast: {
      label: 'Raňajky',
      badge: 'R',
      textClass: 'text-amber-700 dark:text-amber-400',
      bgClass: 'bg-amber-500/15',
      borderClass: 'border-amber-500/30',
    },
    lunch: {
      label: 'Obed',
      badge: 'O',
      textClass: 'text-blue-700 dark:text-blue-400',
      bgClass: 'bg-blue-500/15',
      borderClass: 'border-blue-500/30',
    },
    dinner: {
      label: 'Večera',
      badge: 'V',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      bgClass: 'bg-emerald-500/15',
      borderClass: 'border-emerald-500/30',
    },
  };

  const config = badgeConfig[mealType];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val, false); // Debounced save
    setShowSuggestions(val.trim().length >= 2);
  };

  const handleSelectSuggestion = (dishName: string) => {
    setInputValue(dishName);
    onChange(dishName, true); // Immediate save
    setShowSuggestions(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setInputValue(value);
      setIsEditing(false);
      setShowSuggestions(false);
    }
  };

  const suggestions = showSuggestions ? getSuggestions(inputValue, 4) : [];

  return (
    <div ref={containerRef} className="relative flex items-center gap-1.5 w-full min-h-[22px] group py-0.5">
      {/* Compact Meal Badge [R] / [O] / [V] */}
      <button
        type="button"
        onClick={onOpenBottomSheet}
        title={`${config.label} - Otvoriť knižnicu`}
        className={`w-4 h-4 shrink-0 rounded flex items-center justify-center text-[10px] font-bold border transition-transform active:scale-90 ${config.bgClass} ${config.textClass} ${config.borderClass}`}
      >
        {config.badge}
      </button>

      {/* Meal Content or Inline Edit Input */}
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1 min-w-0">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Zadaj ${config.label.toLowerCase()}...`}
            className="w-full bg-white dark:bg-[#121212] border border-blue-500 rounded px-2 py-0.5 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-inner"
          />

          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                onChange('', true);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-white p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setShowSuggestions(false);
            }}
            className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 p-0.5"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-between min-w-0 group/slot">
          {/* Clickable text area triggers inline edit */}
          <div
            onClick={() => setIsEditing(true)}
            className="flex-1 min-w-0 text-xs cursor-text py-0.5 px-1 rounded hover:bg-slate-200/60 dark:hover:bg-zinc-800/60 transition-colors"
            title="Klikni pre písanie textu"
          >
            {value ? (
              <MarqueeText text={value} className="text-slate-800 dark:text-zinc-200 font-medium leading-tight" />
            ) : (
              <span className="text-slate-400 dark:text-zinc-600 text-[11px] italic">voľné...</span>
            )}
          </div>

          {/* Quick icon to open Bottom Sheet drawer */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-40 group-hover/slot:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onOpenBottomSheet}
              title="Vybrať z knižnice / vyskladať"
              className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:text-zinc-400 dark:hover:text-blue-400 dark:hover:bg-zinc-800 transition-colors"
            >
              <BookOpen className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Typeahead Autocomplete Popover */}
      {isEditing && showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-6 top-full mt-0.5 w-64 bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-[#27272a] rounded-lg shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-0.5 text-[9px] font-semibold text-slate-400 dark:text-zinc-400 uppercase tracking-wider border-b border-slate-100 dark:border-[#27272a]">
            Našepkávač z knižnice
          </div>
          {suggestions.map((sug) => (
            <div
              key={sug.id}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSelectSuggestion(sug.name);
              }}
              className="px-2 py-1.5 text-xs text-slate-700 dark:text-zinc-200 hover:bg-blue-50 dark:hover:bg-blue-600/20 hover:text-blue-600 dark:hover:text-blue-300 cursor-pointer flex items-center justify-between transition-colors"
            >
              <span className="truncate">{sug.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-2 capitalize shrink-0">{sug.category}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
