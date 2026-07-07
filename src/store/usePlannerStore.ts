// ============================================
// Planner State Store (Zustand)
// ============================================

import { create } from 'zustand';
import type { DailyPlan } from '../types';

interface PlannerState {
  // Data
  selectedDate: string; // YYYY-MM-DD
  dailyPlans: DailyPlan[];
  calendarEvents: Array<{
    id: string;
    summary: string;
    start: string;
    end: string;
  }>;

  // Calendar sync
  calendarConnected: boolean;
  calendarSyncing: boolean;
  lastSyncTime: string | null;

  // Actions
  setSelectedDate: (date: string) => void;
  setDailyPlans: (plans: DailyPlan[]) => void;
  addDailyPlan: (plan: DailyPlan) => void;
  updateDailyPlan: (id: string, updates: Partial<DailyPlan>) => void;
  removeDailyPlan: (id: string) => void;
  setCalendarEvents: (events: Array<{ id: string; summary: string; start: string; end: string }>) => void;
  setCalendarConnected: (connected: boolean) => void;
  setCalendarSyncing: (syncing: boolean) => void;
  setLastSyncTime: (time: string | null) => void;
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const usePlannerStore = create<PlannerState>((set) => ({
  selectedDate: getTodayString(),
  dailyPlans: [],
  calendarEvents: [],
  calendarConnected: false,
  calendarSyncing: false,
  lastSyncTime: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setDailyPlans: (plans) => set({ dailyPlans: plans }),
  addDailyPlan: (plan) =>
    set((s) => ({ dailyPlans: [...s.dailyPlans, plan] })),
  updateDailyPlan: (id, updates) =>
    set((s) => ({
      dailyPlans: s.dailyPlans.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  removeDailyPlan: (id) =>
    set((s) => ({ dailyPlans: s.dailyPlans.filter((p) => p.id !== id) })),
  setCalendarEvents: (events) => set({ calendarEvents: events }),
  setCalendarConnected: (connected) => set({ calendarConnected: connected }),
  setCalendarSyncing: (syncing) => set({ calendarSyncing: syncing }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
}));
