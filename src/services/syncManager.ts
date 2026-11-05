import { RealtimeChannel } from '@supabase/supabase-js';
import { WeekPlan, Dish, UserProfile } from '../types';
import { getSupabaseClient } from './supabase';
import { INITIAL_DISHES, createEmptyWeek } from '../utils/defaultData';

export type SyncStatus = 'connected' | 'local' | 'connecting' | 'offline';

const STORAGE_KEY_USER = 'jedalnicek_user_profile';
const STORAGE_PREFIX_WEEK = 'jedalnicek_week_';
const STORAGE_KEY_DISHES = 'jedalnicek_dishes';

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  online_at: number;
}

export function getCurrentUser(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(e);
  }

  // Generate random default profile for two users
  const isSecond = Math.random() > 0.5;
  const user: UserProfile = {
    id: `user_${Math.random().toString(36).substring(2, 9)}`,
    name: isSecond ? 'Partner' : 'Ja',
    color: isSecond ? '#ec4899' : '#3b82f6', // pink or blue
  };

  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  return user;
}

export function updateCurrentUser(updates: Partial<UserProfile>): UserProfile {
  const current = getCurrentUser();
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
  syncManager.updatePresence(updated);
  return updated;
}

class SyncManager {
  private channel: BroadcastChannel | null = null;
  private supabaseChannel: RealtimeChannel | null = null;
  private weekSubscribers: Map<string, Set<(plan: WeekPlan) => void>> = new Map();
  private dishesSubscribers: Set<(dishes: Dish[]) => void> = new Set();
  private presenceSubscribers: Set<(users: PresenceUser[]) => void> = new Set();
  private statusSubscribers: Set<(status: SyncStatus) => void> = new Set();

  private activeUsersMap: Map<string, PresenceUser> = new Map();
  private currentStatus: SyncStatus = 'connecting';
  private heartbeatTimer: number | null = null;

  constructor() {
    this.initBroadcastChannel();
    this.initSupabaseSync();
    this.startPresenceHeartbeat();
  }

  private initBroadcastChannel() {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;

    try {
      this.channel = new BroadcastChannel('jedalnicek_sync_channel');
      this.channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'WEEK_UPDATED' && payload?.id) {
          this.notifyWeekSubscribers(payload.id, payload, false);
        } else if (type === 'DISHES_UPDATED' && Array.isArray(payload)) {
          this.notifyDishesSubscribers(payload, false);
        } else if (type === 'PRESENCE_PING' && payload?.id) {
          this.handlePresencePing(payload);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not available', e);
    }
  }

  public initSupabaseSync() {
    const supabase = getSupabaseClient();

    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
      this.supabaseChannel = null;
    }

    if (!supabase) {
      this.setStatus('local');
      return;
    }

    this.setStatus('connecting');

    try {
      const channel = supabase.channel('meal-plan-sync', {
        config: {
          presence: {
            key: getCurrentUser().id,
          },
        },
      });

      // Listen for database changes on weeks
      channel
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'weeks' },
          (payload) => {
            if (payload.new && (payload.new as WeekPlan).id) {
              const updatedWeek = payload.new as WeekPlan;
              // Save to localStorage
              localStorage.setItem(`${STORAGE_PREFIX_WEEK}${updatedWeek.id}`, JSON.stringify(updatedWeek));
              this.notifyWeekSubscribers(updatedWeek.id, updatedWeek, true);
            }
          }
        )
        // Listen for database changes on dishes
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'dishes' },
          async () => {
            // Re-fetch dishes from supabase
            this.fetchDishesFromSupabase();
          }
        )
        // Realtime presence
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const users: PresenceUser[] = [];
          Object.values(presenceState).forEach((presences: any) => {
            presences.forEach((p: any) => {
              if (p.user) {
                users.push(p.user);
              }
            });
          });
          this.setPresenceUsers(users);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            this.setStatus('connected');
            const currentUser = getCurrentUser();
            await channel.track({
              user: {
                id: currentUser.id,
                name: currentUser.name,
                color: currentUser.color,
                online_at: Date.now(),
              },
            });
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.setStatus('local');
          }
        });

      this.supabaseChannel = channel;
    } catch (e) {
      console.error('Error connecting to Supabase realtime:', e);
      this.setStatus('local');
    }
  }

  private startPresenceHeartbeat() {
    const ping = () => {
      const me = getCurrentUser();
      const presenceData: PresenceUser = {
        id: me.id,
        name: me.name,
        color: me.color,
        online_at: Date.now(),
      };

      // Add self
      this.activeUsersMap.set(me.id, presenceData);

      // Clean stale users (older than 12s)
      const now = Date.now();
      for (const [id, user] of this.activeUsersMap.entries()) {
        if (id !== me.id && now - user.online_at > 12000) {
          this.activeUsersMap.delete(id);
        }
      }

      this.notifyPresence();

      // Broadcast locally
      if (this.channel) {
        this.channel.postMessage({
          type: 'PRESENCE_PING',
          payload: presenceData,
        });
      }
    };

    ping();
    if (typeof window !== 'undefined') {
      this.heartbeatTimer = window.setInterval(ping, 4000);
    }
  }

  public destroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handlePresencePing(user: PresenceUser) {
    this.activeUsersMap.set(user.id, user);
    this.notifyPresence();
  }

  private notifyPresence() {
    const users = Array.from(this.activeUsersMap.values());
    this.presenceSubscribers.forEach((fn) => fn(users));
  }

  private setPresenceUsers(users: PresenceUser[]) {
    this.activeUsersMap.clear();
    users.forEach((u) => this.activeUsersMap.set(u.id, u));
    this.notifyPresence();
  }

  public updatePresence(user: UserProfile) {
    this.activeUsersMap.set(user.id, {
      id: user.id,
      name: user.name,
      color: user.color,
      online_at: Date.now(),
    });
    this.notifyPresence();

    if (this.supabaseChannel) {
      this.supabaseChannel.track({
        user: {
          id: user.id,
          name: user.name,
          color: user.color,
          online_at: Date.now(),
        },
      });
    }
  }

  private setStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.statusSubscribers.forEach((fn) => fn(status));
  }

  public getStatus(): SyncStatus {
    return this.currentStatus;
  }

  public onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusSubscribers.add(callback);
    callback(this.currentStatus);
    return () => this.statusSubscribers.delete(callback);
  }

  public onPresenceChange(callback: (users: PresenceUser[]) => void): () => void {
    this.presenceSubscribers.add(callback);
    callback(Array.from(this.activeUsersMap.values()));
    return () => this.presenceSubscribers.delete(callback);
  }

  // --- WEEK PLAN SYNC ---

  public getWeek(weekId: string): WeekPlan {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_WEEK}${weekId}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error parsing week from storage', e);
      }
    }
    return createEmptyWeek(weekId);
  }

  public async fetchWeekFromSupabase(weekId: string): Promise<WeekPlan | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('weeks')
        .select('*')
        .eq('id', weekId)
        .single();

      if (!error && data) {
        const plan: WeekPlan = {
          id: data.id,
          days: data.days,
          updated_at: data.updated_at,
          updated_by: data.updated_by,
        };
        localStorage.setItem(`${STORAGE_PREFIX_WEEK}${weekId}`, JSON.stringify(plan));
        this.notifyWeekSubscribers(weekId, plan, false);
        return plan;
      }
    } catch (e) {
      console.warn('Supabase fetch week error:', e);
    }
    return null;
  }

  public async saveWeek(plan: WeekPlan): Promise<void> {
    const updatedPlan: WeekPlan = {
      ...plan,
      updated_at: new Date().toISOString(),
      updated_by: getCurrentUser().name,
    };

    // 1. Save to local storage
    localStorage.setItem(`${STORAGE_PREFIX_WEEK}${plan.id}`, JSON.stringify(updatedPlan));

    // 2. Broadcast to other local tabs
    if (this.channel) {
      this.channel.postMessage({
        type: 'WEEK_UPDATED',
        payload: updatedPlan,
      });
    }

    // 3. Notify local subscribers
    this.notifyWeekSubscribers(plan.id, updatedPlan, false);

    // 4. Upsert to Supabase
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.from('weeks').upsert({
          id: updatedPlan.id,
          days: updatedPlan.days,
          updated_at: updatedPlan.updated_at,
          updated_by: updatedPlan.updated_by,
        });
        if (error) {
          console.warn('Supabase upsert week error:', error);
        }
      } catch (e) {
        console.error('Error pushing week to Supabase:', e);
      }
    }
  }

  public subscribeWeek(weekId: string, callback: (plan: WeekPlan) => void): () => void {
    if (!this.weekSubscribers.has(weekId)) {
      this.weekSubscribers.set(weekId, new Set());
    }
    this.weekSubscribers.get(weekId)!.add(callback);

    // Initial load
    const current = this.getWeek(weekId);
    callback(current);

    // Try fetching remote
    this.fetchWeekFromSupabase(weekId);

    return () => {
      const set = this.weekSubscribers.get(weekId);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.weekSubscribers.delete(weekId);
        }
      }
    };
  }

  private notifyWeekSubscribers(weekId: string, plan: WeekPlan, broadcastLocal = true) {
    const subscribers = this.weekSubscribers.get(weekId);
    if (subscribers) {
      subscribers.forEach((fn) => fn(plan));
    }
    if (broadcastLocal && this.channel) {
      this.channel.postMessage({
        type: 'WEEK_UPDATED',
        payload: plan,
      });
    }
  }

  // --- DISHES SYNC ---

  public getDishes(): Dish[] {
    const raw = localStorage.getItem(STORAGE_KEY_DISHES);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing dishes from storage', e);
      }
    }

    // Seed default dishes
    localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(INITIAL_DISHES));
    return INITIAL_DISHES;
  }

  public async fetchDishesFromSupabase(): Promise<Dish[] | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('dishes')
        .select('*')
        .order('name');

      if (!error && data && data.length > 0) {
        const dishes = data as Dish[];
        localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(dishes));
        this.notifyDishesSubscribers(dishes, false);
        return dishes;
      }
    } catch (e) {
      console.warn('Supabase fetch dishes error:', e);
    }
    return null;
  }

  public async saveDishes(dishes: Dish[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY_DISHES, JSON.stringify(dishes));

    if (this.channel) {
      this.channel.postMessage({
        type: 'DISHES_UPDATED',
        payload: dishes,
      });
    }

    this.notifyDishesSubscribers(dishes, false);
  }

  public async addDish(dish: Omit<Dish, 'id'>): Promise<Dish> {
    const newDish: Dish = {
      ...dish,
      id: `dish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    const dishes = this.getDishes();
    const updated = [newDish, ...dishes];
    await this.saveDishes(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('dishes').insert(newDish);
      } catch (e) {
        console.warn('Supabase insert dish error:', e);
      }
    }

    return newDish;
  }

  public async toggleDishFavorite(dishId: string): Promise<void> {
    const dishes = this.getDishes();
    const target = dishes.find((d) => d.id === dishId);
    if (!target) return;

    target.is_favorite = !target.is_favorite;
    await this.saveDishes(dishes);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('dishes').update({ is_favorite: target.is_favorite }).eq('id', dishId);
      } catch (e) {
        console.warn('Supabase update favorite error:', e);
      }
    }
  }

  public async deleteDish(dishId: string): Promise<void> {
    const dishes = this.getDishes().filter((d) => d.id !== dishId);
    await this.saveDishes(dishes);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('dishes').delete().eq('id', dishId);
      } catch (e) {
        console.warn('Supabase delete dish error:', e);
      }
    }
  }

  public subscribeDishes(callback: (dishes: Dish[]) => void): () => void {
    this.dishesSubscribers.add(callback);
    callback(this.getDishes());

    // Try fetching remote
    this.fetchDishesFromSupabase();

    return () => {
      this.dishesSubscribers.delete(callback);
    };
  }

  private notifyDishesSubscribers(dishes: Dish[], broadcastLocal = true) {
    this.dishesSubscribers.forEach((fn) => fn(dishes));
    if (broadcastLocal && this.channel) {
      this.channel.postMessage({
        type: 'DISHES_UPDATED',
        payload: dishes,
      });
    }
  }
}

export const syncManager = new SyncManager();
