import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { WeekDashboard } from './components/WeekDashboard';
import { BottomSheetDrawer } from './components/BottomSheetDrawer';
import { MealCatalogModal } from './components/MealCatalogModal';
import { SyncSettingsModal } from './components/SyncSettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { useMealPlan } from './hooks/useMealPlan';
import { useDishes } from './hooks/useDishes';
import {
  syncManager,
  SyncStatus,
  PresenceUser,
  getCurrentUser,
  updateCurrentUser,
} from './services/syncManager';
import { DayKey, MealType, UserProfile } from './types';
import { getISOWeekInfo, shiftWeekId, formatWeekRange } from './utils/dateUtils';
import { checkAndApplyUrlHashConfig } from './services/supabase';
import { Theme, getInitialTheme, applyTheme } from './utils/theme';

export function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [currentWeekId, setCurrentWeekId] = useState<string>(() => getISOWeekInfo().weekId);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getCurrentUser());
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');

  // Apply theme on load and sync
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  // Meal plan hook for active week
  const { plan, isSaving, updateMeal, copyToWeek, clearWeek } = useMealPlan(currentWeekId);

  // Dishes catalog hook
  const { dishes, addDish, toggleFavorite, deleteDish, getSuggestions } = useDishes();

  // Bottom Sheet state
  const [bottomSheetDay, setBottomSheetDay] = useState<DayKey | null>(null);
  const [bottomSheetMeal, setBottomSheetMeal] = useState<MealType | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmCopyOpen, setIsConfirmCopyOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Temporary feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  // Check if opened via QR code or partner connect link
  useEffect(() => {
    if (checkAndApplyUrlHashConfig()) {
      syncManager.initSupabaseSync();
      showToast('🎉 Zariadenie bolo úspešne prepojené s databázou!');
    }
  }, [showToast]);

  // Sync manager subscriptions
  useEffect(() => {
    const unsubStatus = syncManager.onStatusChange((status) => {
      setSyncStatus(status);
    });
    const unsubPresence = syncManager.onPresenceChange((users) => {
      setActiveUsers(users);
    });

    return () => {
      unsubStatus();
      unsubPresence();
    };
  }, []);

  // Update profile
  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    const updated = updateCurrentUser(updates);
    setCurrentUser(updated);
    showToast(`Profil upravený: ${updated.name}`);
  };

  // Open Bottom Sheet for specific slot
  const handleOpenBottomSheet = (day: DayKey, meal: MealType) => {
    setBottomSheetDay(day);
    setBottomSheetMeal(meal);
    setIsBottomSheetOpen(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setBottomSheetDay(null);
    setBottomSheetMeal(null);
  };

  // Pick dish from Bottom Sheet
  const handleSelectFromBottomSheet = (dishText: string) => {
    if (bottomSheetDay && bottomSheetMeal) {
      updateMeal(bottomSheetDay, bottomSheetMeal, dishText, true);
    }
  };

  // Copy to next week
  const nextWeekId = shiftWeekId(currentWeekId, 1);
  const handleConfirmCopy = async () => {
    await copyToWeek(nextWeekId);
    showToast(`Jedálniček bol skopírovaný do ${formatWeekRange(nextWeekId).weekNumber}. týždňa!`);
  };

  // Clear current week
  const handleConfirmClear = async () => {
    await clearWeek();
    showToast('Jedálniček pre tento týždeň bol vyčistený.');
  };

  const currentSlotValue =
    bottomSheetDay && bottomSheetMeal ? plan.days[bottomSheetDay]?.[bottomSheetMeal] || '' : '';

  return (
    <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-[#121212] text-slate-900 dark:text-[#f4f4f5] select-none transition-colors">
      {/* Top Header */}
      <Header
        currentWeekId={currentWeekId}
        isSaving={isSaving}
        syncStatus={syncStatus}
        activeUsers={activeUsers}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onChangeWeek={setCurrentWeekId}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRequestCopyWeek={() => setIsConfirmCopyOpen(true)}
        onRequestClearWeek={() => setIsConfirmClearOpen(true)}
      />

      {/* 7-Day High-Density Dashboard */}
      <WeekDashboard
        plan={plan}
        onUpdateMeal={updateMeal}
        onOpenBottomSheet={handleOpenBottomSheet}
        getSuggestions={getSuggestions}
      />

      {/* Bottom Sheet Drawer for Meal Selection & Multi-Component Composer */}
      <BottomSheetDrawer
        isOpen={isBottomSheetOpen}
        dayKey={bottomSheetDay}
        mealType={bottomSheetMeal}
        currentValue={currentSlotValue}
        dishes={dishes}
        onSelect={handleSelectFromBottomSheet}
        onAddDish={addDish}
        onToggleFavorite={toggleFavorite}
        onClose={handleCloseBottomSheet}
      />

      {/* Catalog Manager Modal */}
      <MealCatalogModal
        isOpen={isCatalogOpen}
        dishes={dishes}
        onAddDish={addDish}
        onToggleFavorite={toggleFavorite}
        onDeleteDish={deleteDish}
        onClose={() => setIsCatalogOpen(false)}
      />

      {/* Sync & User Settings Modal */}
      <SyncSettingsModal
        isOpen={isSettingsOpen}
        currentUser={currentUser}
        activeUsers={activeUsers}
        syncStatus={syncStatus}
        onUpdateUser={handleUpdateUser}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Confirm Copy to Next Week Dialog */}
      <ConfirmModal
        isOpen={isConfirmCopyOpen}
        title="Kopírovať do budúceho týždňa"
        message={`Chcete skopírovať jedlá z aktuálneho týždňa do budúceho (${formatWeekRange(nextWeekId).weekNumber}. týždeň)? Prípadné existujúce jedlá v budúcom týždni budú nahradené.`}
        confirmLabel="Áno, skopírovať"
        confirmVariant="primary"
        onConfirm={handleConfirmCopy}
        onCancel={() => setIsConfirmCopyOpen(false)}
      />

      {/* Confirm Clear Week Dialog */}
      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="Vyčistiť tento týždeň?"
        message="Naozaj chcete vymazať všetky zadané raňajky, obedy a večere pre tento týždeň? Táto akcia je nevratná."
        confirmLabel="Vyčistiť"
        confirmVariant="danger"
        onConfirm={handleConfirmClear}
        onCancel={() => setIsConfirmClearOpen(false)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-zinc-800 text-white text-xs font-medium rounded-full shadow-lg border border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
