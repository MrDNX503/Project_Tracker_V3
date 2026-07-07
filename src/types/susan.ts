/* ============================================================
   KashFinance Project Tracker V3 — Susan AI Types
   ============================================================ */

/** Message role in conversation */
export type MessageRole = 'user' | 'susan' | 'system';

/** Susan's mood/personality state */
export type SusanMood =
  | 'neutral'
  | 'encouraging'
  | 'analytical'
  | 'celebratory'
  | 'concerned'
  | 'focused';

/** Types of actions Susan can suggest */
export type SusanActionType =
  | 'create-task'
  | 'update-status'
  | 'reschedule'
  | 'break-down-task'
  | 'set-priority'
  | 'add-milestone'
  | 'generate-plan'
  | 'navigate'
  | 'custom';

/** A single message in the conversation */
export interface SusanMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  mood: SusanMood;
  actions: SusanAction[];
  references: SusanReference[];
  isStreaming: boolean;
  error: string | null;
  functionCall?: any; // any to avoid importing from @google/generative-ai in types
}

/** An actionable suggestion from Susan */
export interface SusanAction {
  id: string;
  type: SusanActionType;
  label: string;
  description: string;
  payload: Record<string, unknown>;
  executed: boolean;
  executedAt: string | null;
}

/** A reference to a project/task/milestone */
export interface SusanReference {
  type: 'project' | 'task' | 'milestone' | 'plan';
  id: string;
  title: string;
  status: string;
}

/** Context provided to Susan for generating responses */
export interface ConversationContext {
  activeProjectId: string | null;
  currentPage: string;
  recentActivity: ActivityEntry[];
  upcomingDeadlines: DeadlineEntry[];
  todaysPlan: TodayPlanSummary | null;
  productivityScore: ProductivityScore | null;
  userPreferences: SusanPreferences;
}

/** Recent activity entry for context */
export interface ActivityEntry {
  type: 'task-completed' | 'task-created' | 'status-changed' | 'milestone-reached' | 'log-added';
  description: string;
  timestamp: string;
  projectId: string;
  entityId: string;
}

/** Upcoming deadline for context */
export interface DeadlineEntry {
  entityType: 'task' | 'milestone' | 'project';
  entityId: string;
  title: string;
  projectName: string;
  dueDate: string;
  daysRemaining: number;
  isOverdue: boolean;
}

/** Summary of today's plan for context */
export interface TodayPlanSummary {
  dayGoal: string;
  totalTasks: number;
  completedTasks: number;
  totalTimeBlocks: number;
  currentTimeBlock: string | null;
  nextTimeBlock: string | null;
}

/* ── Insights & Analytics ── */

/** Types of insight cards Susan can generate */
export type InsightType =
  | 'productivity-trend'
  | 'velocity-change'
  | 'deadline-risk'
  | 'streak'
  | 'suggestion'
  | 'celebration'
  | 'pattern'
  | 'bottleneck';

/** An insight card displayed on the dashboard */
export interface InsightCard {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  metric: string | null;
  metricLabel: string | null;
  trend: 'up' | 'down' | 'stable' | null;
  trendPercent: number | null;
  icon: string;
  color: string;
  actions: SusanAction[];
  priority: number;
  generatedAt: string;
  expiresAt: string | null;
  dismissed: boolean;
}

/** Productivity score breakdown */
export interface ProductivityScore {
  overall: number;
  breakdown: {
    tasksCompleted: ScoreComponent;
    hoursLogged: ScoreComponent;
    milestonesHit: ScoreComponent;
    consistencyStreak: ScoreComponent;
    planAdherence: ScoreComponent;
  };
  trend: 'improving' | 'stable' | 'declining';
  trendPercent: number;
  periodStart: string;
  periodEnd: string;
  previousScore: number | null;
}

/** Individual score component */
export interface ScoreComponent {
  value: number;
  maxValue: number;
  weight: number;
  label: string;
}

/* ── Susan Preferences ── */

/** User preferences for Susan's behavior */
export interface SusanPreferences {
  personality: 'professional' | 'friendly' | 'minimal';
  proactiveInsights: boolean;
  dailySummary: boolean;
  dailySummaryTime: string;
  celebrateCompletions: boolean;
  suggestBreaks: boolean;
  motivationalQuotes: boolean;
}

/* ── Conversation Management ── */

/** A saved conversation thread */
export interface Conversation {
  id: string;
  title: string;
  messages: SusanMessage[];
  context: ConversationContext;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

/** Susan's state in the UI */
export interface SusanUIState {
  isOpen: boolean;
  isMinimized: boolean;
  currentConversationId: string | null;
  isTyping: boolean;
  mood: SusanMood;
  lastInteraction: string | null;
  unreadInsights: number;
}
