import { useState, useEffect, useMemo, useCallback } from 'react';
import { Dish, DishCategory } from '../types';
import { syncManager } from '../services/syncManager';

export function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>(() => syncManager.getDishes());

  useEffect(() => {
    const unsubscribe = syncManager.subscribeDishes((updatedDishes) => {
      setDishes(updatedDishes);
    });
    return unsubscribe;
  }, []);

  const addDish = useCallback(async (name: string, category: DishCategory) => {
    if (!name.trim()) return null;
    return await syncManager.addDish({
      name: name.trim(),
      category,
      is_favorite: false,
    });
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    await syncManager.toggleDishFavorite(id);
  }, []);

  const deleteDish = useCallback(async (id: string) => {
    await syncManager.deleteDish(id);
  }, []);

  // Quick typeahead autocomplete suggestions
  const getSuggestions = useCallback(
    (query: string, limit = 5): Dish[] => {
      if (!query || query.trim().length < 2) return [];
      const q = query.toLowerCase().trim();
      return dishes
        .filter((d) => d.name.toLowerCase().includes(q))
        .sort((a, b) => {
          // Prioritize exact match or startsWith
          const aStarts = a.name.toLowerCase().startsWith(q);
          const bStarts = b.name.toLowerCase().startsWith(q);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          // Then favorites
          if (a.is_favorite && !b.is_favorite) return -1;
          if (!a.is_favorite && b.is_favorite) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, limit);
    },
    [dishes]
  );

  // Group dishes by category
  const dishesByCategory = useMemo(() => {
    const map: Record<DishCategory, Dish[]> = {
      kuracie: [],
      hovadzie: [],
      prilohy: [],
      oblohy: [],
      bezmasite: [],
      dezerty: [],
    };
    dishes.forEach((d) => {
      if (map[d.category]) {
        map[d.category].push(d);
      }
    });
    return map;
  }, [dishes]);

  return {
    dishes,
    dishesByCategory,
    addDish,
    toggleFavorite,
    deleteDish,
    getSuggestions,
  };
}
