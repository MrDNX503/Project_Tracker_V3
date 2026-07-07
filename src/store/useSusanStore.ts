// ============================================
// Susan AI State Store (Zustand)
// ============================================

import { create } from 'zustand';
import type { SusanMessage, ProductivityAnalysis } from '../types';

interface SusanState {
  // Chat
  messages: SusanMessage[];
  isThinking: boolean;
  isPanelOpen: boolean;

  // Analysis
  latestAnalysis: ProductivityAnalysis | null;
  morningBriefing: string | null;

  // Configuration
  aiConfigured: boolean;
  apiKey: string | null;

  // Actions
  addMessage: (message: SusanMessage) => void;
  setMessages: (messages: SusanMessage[]) => void;
  clearMessages: () => void;
  setIsThinking: (thinking: boolean) => void;
  togglePanel: () => void;
  setPanelOpen: (open: boolean) => void;
  setLatestAnalysis: (analysis: ProductivityAnalysis | null) => void;
  setMorningBriefing: (briefing: string | null) => void;
  setAIConfigured: (configured: boolean) => void;
  setApiKey: (key: string | null) => void;
}

export const useSusanStore = create<SusanState>((set) => ({
  messages: [],
  isThinking: false,
  isPanelOpen: false,
  latestAnalysis: null,
  morningBriefing: null,
  aiConfigured: false,
  apiKey: null,

  addMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),
  clearMessages: () => set({ messages: [] }),
  setIsThinking: (thinking) => set({ isThinking: thinking }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  setLatestAnalysis: (analysis) => set({ latestAnalysis: analysis }),
  setMorningBriefing: (briefing) => set({ morningBriefing: briefing }),
  setAIConfigured: (configured) => set({ aiConfigured: configured }),
  setApiKey: (key) => set({ apiKey: key }),
}));
