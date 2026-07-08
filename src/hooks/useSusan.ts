// ============================================
// Susan AI Interaction Hook
// ============================================

import { useCallback, useEffect } from 'react';
import { useSusanStore } from '../store/useSusanStore';
import { useDatabase } from './useDatabase';
import { useProjectStore } from '../store/useProjectStore';
import { usePlannerStore } from '../store/usePlannerStore';
import * as susanAI from '../services/susanAI';
import type { SusanContext, SusanMessage } from '../types';
import { getTodayISO, daysBetween } from '../utils/dates';

/**
 * Hook for interacting with Susan AI
 */
export function useSusan() {
  const { db } = useDatabase();
  const addMessage = useSusanStore((s) => s.addMessage);
  const setMessages = useSusanStore((s) => s.setMessages);
  const setIsThinking = useSusanStore((s) => s.setIsThinking);
  const setLatestAnalysis = useSusanStore((s) => s.setLatestAnalysis);
  const setMorningBriefing = useSusanStore((s) => s.setMorningBriefing);
  const isThinking = useSusanStore((s) => s.isThinking);
  const messages = useSusanStore((s) => s.messages);
  const isPanelOpen = useSusanStore((s) => s.isPanelOpen);
  const togglePanel = useSusanStore((s) => s.togglePanel);
  const apiKey = useSusanStore((s) => s.apiKey);

  // Load chat history from the database once
  useEffect(() => {
    if (!db) return;
    (async () => {
      try {
        if (useSusanStore.getState().messages.length > 0) return;
        const history = await db.getSusanHistory(50);
        if (history.length > 0) {
          setMessages(history.map((h) => ({
            id: h.id,
            role: h.role,
            content: h.content,
            timestamp: h.created_at,
          })));
        }
      } catch (err) {
        console.error('[Susan] Failed to load chat history:', err);
      }
    })();
  }, [db, setMessages]);

  /** Persist a chat message (fire-and-forget) */
  const persistMessage = useCallback((role: 'user' | 'susan', content: string) => {
    if (!db || !content) return;
    db.saveSusanMessage({ role, content }).catch((err) =>
      console.warn('[Susan] Could not persist message:', err)
    );
  }, [db]);

  const projects = useProjectStore((s) => s.projects);
  const tasks = useProjectStore((s) => s.tasks);
  const progressLogs = useProjectStore((s) => s.progressLogs);
  const dailyPlans = usePlannerStore((s) => s.dailyPlans);

  /**
   * Build context from current app state
   */
  const buildContext = useCallback((): SusanContext => {
    const today = getTodayISO();

    return {
      currentTime: new Date().toLocaleString(),
      userName: 'MrDNX',
      projects: projects
        .filter((p) => p.status === 'active' || p.status === 'planning')
        .map((p) => {
          const projectTasks = tasks.filter((t) => t.project_id === p.id);
          return {
            name: p.name,
            status: p.status,
            progress: p.progress || 0,
            tasksTotal: projectTasks.length,
            tasksCompleted: projectTasks.filter((t) => t.status === 'done').length,
            daysUntilDeadline: p.target_date
              ? daysBetween(today, p.target_date)
              : undefined,
          };
        }),
      todayPlan: dailyPlans
        .filter((dp) => dp.plan_date === today)
        .map((dp) => ({
          title: dp.title || 'Plan',
          timeStart: dp.time_start ?? undefined,
          timeEnd: dp.time_end ?? undefined,
          status: dp.status,
        })),
      recentLogs: progressLogs.slice(0, 10).map((log) => ({
        content: log.content || '',
        mood: log.mood || undefined,
        loggedAt: log.logged_at,
      })),
    };
  }, [projects, tasks, progressLogs, dailyPlans]);

  /**
   * Send a message to Susan
   */
  const sendMessage = useCallback(async (text: string) => {
    const userMessage: SusanMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      mood: 'neutral',
      actions: [],
      references: [],
      isStreaming: false,
      error: null
    };

    addMessage(userMessage);
    persistMessage('user', text);
    setIsThinking(true);

    try {
      const context = buildContext();
      const response = await susanAI.chatWithSusan(text, context);

      const susanMessage: SusanMessage = {
        id: crypto.randomUUID(),
        role: 'susan',
        content: response.error || response.text || (response.functionCall ? 'I need to perform an action.' : ''),
        functionCall: response.functionCall,
        timestamp: new Date().toISOString(),
        mood: 'neutral',
        actions: [],
        references: [],
        isStreaming: false,
        error: response.error || null
      };

      addMessage(susanMessage);
      persistMessage('susan', susanMessage.content);
    } catch (error) {
      const errorMsg: SusanMessage = {
        id: crypto.randomUUID(),
        role: 'susan',
        content: `🤖 Error: ${error instanceof Error ? error.message : 'Something went wrong'}`,
        timestamp: new Date().toISOString(),
        mood: 'neutral',
        actions: [],
        references: [],
        isStreaming: false,
        error: null
      };
      addMessage(errorMsg);
    } finally {
      setIsThinking(false);
    }
  }, [addMessage, setIsThinking, buildContext, persistMessage]);

  /**
   * Get morning briefing
   */
  const getMorningBriefing = useCallback(async () => {
    setIsThinking(true);
    try {
      const context = buildContext();
      const briefing = await susanAI.generateMorningBriefing(context);
      setMorningBriefing(briefing);
      return briefing;
    } finally {
      setIsThinking(false);
    }
  }, [buildContext, setIsThinking, setMorningBriefing]);

  /**
   * Run productivity analysis
   */
  const analyzeProductivity = useCallback(async () => {
    setIsThinking(true);
    try {
      const context = buildContext();
      const analysis = await susanAI.analyzeProductivity(context);
      setLatestAnalysis(analysis);
      return analysis;
    } finally {
      setIsThinking(false);
    }
  }, [buildContext, setIsThinking, setLatestAnalysis]);

  /**
   * Initialize Susan with API key
   */
  const initializeSusan = useCallback((key: string) => {
    susanAI.initSusanAI(key);
    useSusanStore.getState().setAIConfigured(true);
    useSusanStore.getState().setApiKey(key);
  }, []);

  /**
   * Handle function call response
   */
  const handleFunctionResponse = useCallback(async (functionName: string, responseObj: any) => {
    setIsThinking(true);
    try {
      const response = await susanAI.sendFunctionResponseToSusan(functionName, responseObj);
      
      const susanMessage: SusanMessage = {
        id: crypto.randomUUID(),
        role: 'susan',
        content: response.error || response.text || (response.functionCall ? 'I need to perform another action.' : ''),
        functionCall: response.functionCall,
        timestamp: new Date().toISOString(),
        mood: 'neutral',
        actions: [],
        references: [],
        isStreaming: false,
        error: response.error || null
      };

      addMessage(susanMessage);
      persistMessage('susan', susanMessage.content);
    } catch (error) {
      console.error(error);
    } finally {
      setIsThinking(false);
    }
  }, [addMessage, setIsThinking]);

  return {
    sendMessage,
    getMorningBriefing,
    analyzeProductivity,
    initializeSusan,
    handleFunctionResponse,
    isThinking,
    messages,
    isPanelOpen,
    togglePanel,
    isConfigured: susanAI.isSusanReady(),
    apiKey,
  };
}
