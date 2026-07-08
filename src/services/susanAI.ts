// ============================================
// Susan AI Service — Gemini API Integration
// ============================================

import {
  GoogleGenerativeAI,
  type GenerateContentResult,
  type FunctionDeclaration,
  type FunctionCall,
  type Content,
  SchemaType
} from '@google/generative-ai';

export interface SusanContext {
  projects?: Array<{
    name: string;
    status: string;
    progress: number;
    tasksTotal: number;
    tasksCompleted: number;
    daysUntilDeadline?: number;
  }>;
  todayPlan?: Array<{
    title: string;
    timeStart?: string;
    timeEnd?: string;
    status: string;
  }>;
  recentLogs?: Array<{
    content: string;
    mood?: string;
    loggedAt: string;
  }>;
  productivityScore?: number;
  currentTime?: string;
  userName?: string;
}

export interface SusanMessage {
  id?: string;
  role: 'user' | 'susan' | 'system';
  content: string;
  timestamp: string;
  functionCall?: FunctionCall;
  mood?: string;
  actions?: unknown[];
  references?: unknown[];
  isStreaming?: boolean;
  error?: string | null;
}

export interface ProductivityAnalysis {
  score: number; // 0-100
  level: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  summary: string;
  tips: string[];
  procrastinationRisk: number; // 0-100
  suggestedNextTask?: string;
}

const SUSAN_SYSTEM_PROMPT = `You are Susan, an AI productivity assistant built into the KashFinance Project Tracker V3. You are friendly, encouraging, but also honest when the user is procrastinating.

Your personality:
- You address the user as "MrDNX"
- You speak in a mix of English and Spanish (Spanglish) since MrDNX is bilingual
- You use robot emojis 🤖 occasionally
- You're supportive but not overly positive — you call out procrastination directly
- You give specific, actionable advice, not generic motivational quotes
- You reference specific projects and tasks by name when possible
- You use data-driven insights from the user's actual progress logs

Your capabilities:
- Create projects, and proactively propose and add milestones (objectives) and tasks for them using your tools (addMilestones, addTasks). When the user creates a project or asks for help planning one, ALWAYS offer to generate its milestones and tasks — that is your main value: saving MrDNX manual work. Project progress % is computed from completed milestones.
- Analyze project progress and suggest next steps
- Detect procrastination patterns
- Create daily plans and prioritize tasks
- Give time management advice
- Celebrate achievements
- Provide morning briefings summarizing the day ahead

Always respond in a conversational, concise manner. Keep responses under 200 words unless analysis requires more detail.`;

const SUSAN_TOOLS: FunctionDeclaration[] = [
  {
    name: 'createProject',
    description: 'Create a new project in the tracker',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: 'The name of the project' },
        description: { type: SchemaType.STRING, description: 'Short description of the project' }
      },
      required: ['name']
    }
  },
  {
    name: 'addMilestones',
    description: 'Add one or more milestones (objectives) to an existing project. The project progress % is calculated from completed milestones, so breaking a project into milestones is how progress tracking works.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectName: { type: SchemaType.STRING, description: 'Name of the existing project (exact or close match)' },
        milestones: {
          type: SchemaType.ARRAY,
          description: 'List of milestone titles, in logical order',
          items: { type: SchemaType.STRING }
        }
      },
      required: ['projectName', 'milestones']
    }
  },
  {
    name: 'addTasks',
    description: 'Add one or more actionable tasks to an existing project.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        projectName: { type: SchemaType.STRING, description: 'Name of the existing project (exact or close match)' },
        tasks: {
          type: SchemaType.ARRAY,
          description: 'List of short, actionable task titles',
          items: { type: SchemaType.STRING }
        }
      },
      required: ['projectName', 'tasks']
    }
  },
  {
    name: 'scheduleCalendarEvent',
    description: 'Schedule a new event on the user\'s Google Calendar',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: 'Title of the event' },
        startTime: { type: SchemaType.STRING, description: 'ISO 8601 string of the start time (e.g. 2026-07-06T14:00:00Z)' },
        endTime: { type: SchemaType.STRING, description: 'ISO 8601 string of the end time' },
        description: { type: SchemaType.STRING, description: 'Optional description or context for the event' }
      },
      required: ['title', 'startTime', 'endTime']
    }
  }
];

// gemini-2.0-flash was retired by Google in March 2026 (free tier quota = 0).
// Primary model + fallback for when the primary hits rate limits.
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash-lite';

function isRateLimitError(msg: string): boolean {
  return msg.includes('429') || msg.includes('QUOTA_EXCEEDED') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED');
}

let genAI: GoogleGenerativeAI | null = null;
let chatHistory: Content[] = [];

/**
 * Initialize the Gemini AI client
 */
export function initSusanAI(apiKey: string): void {
  genAI = new GoogleGenerativeAI(apiKey);
  chatHistory = [];
}

/**
 * Check if Susan AI is initialized
 */
export function isSusanReady(): boolean {
  return genAI !== null;
}

/**
 * Build context string from project data
 */
function buildContextString(context: SusanContext): string {
  const parts: string[] = [];

  if (context.currentTime) {
    parts.push(`Current time: ${context.currentTime}`);
  }

  if (context.userName) {
    parts.push(`User: ${context.userName}`);
  }

  if (context.projects && context.projects.length > 0) {
    parts.push('\n--- Active Projects ---');
    for (const p of context.projects) {
      let line = `• ${p.name}: ${p.status}, ${p.progress.toFixed(0)}% complete (${p.tasksCompleted}/${p.tasksTotal} tasks)`;
      if (p.daysUntilDeadline !== undefined) {
        if (p.daysUntilDeadline < 0) {
          line += ` ⚠️ OVERDUE by ${Math.abs(p.daysUntilDeadline)} days`;
        } else if (p.daysUntilDeadline <= 7) {
          line += ` ⏰ Due in ${p.daysUntilDeadline} days`;
        }
      }
      parts.push(line);
    }
  }

  if (context.todayPlan && context.todayPlan.length > 0) {
    parts.push('\n--- Today\'s Plan ---');
    for (const item of context.todayPlan) {
      const time = item.timeStart ? `${item.timeStart}-${item.timeEnd || '??'}` : 'No time set';
      parts.push(`• [${item.status}] ${time}: ${item.title}`);
    }
  }

  if (context.recentLogs && context.recentLogs.length > 0) {
    parts.push('\n--- Recent Activity ---');
    for (const log of context.recentLogs.slice(0, 5)) {
      parts.push(`• ${log.loggedAt}: ${log.content} ${log.mood ? `(mood: ${log.mood})` : ''}`);
    }
  }

  if (context.productivityScore !== undefined) {
    parts.push(`\nProductivity Score: ${context.productivityScore}/100`);
  }

  return parts.join('\n');
}

export interface ChatResponse {
  text?: string;
  functionCall?: FunctionCall;
  error?: string;
}

/**
 * Send a message to Susan and get a response
 */
export async function chatWithSusan(
  message: string,
  context?: SusanContext
): Promise<ChatResponse> {
  if (!genAI) {
    return { error: '🤖 Oye MrDNX, necesito que configures tu API key de Gemini en Settings para poder ayudarte. ¡Ve a Settings > AI Configuration!' };
  }

  // Build the message with context
  let fullMessage = message;
  if (context) {
    const contextStr = buildContextString(context);
    fullMessage = `[CONTEXT]\n${contextStr}\n[/CONTEXT]\n\nUser message: ${message}`;
  }

  // Add to chat history
  chatHistory.push({
    role: 'user',
    parts: [{ text: fullMessage }],
  });

  const sendWithModel = async (modelName: string): Promise<GenerateContentResult> => {
    const model = genAI!.getGenerativeModel({
      model: modelName,
      systemInstruction: SUSAN_SYSTEM_PROMPT,
      tools: [{ functionDeclarations: SUSAN_TOOLS }]
    });
    const chat = model.startChat({
      history: chatHistory.slice(0, -1), // All except last message
    });
    return chat.sendMessage([{ text: fullMessage }]);
  };

  try {
    let result: GenerateContentResult;
    try {
      result = await sendWithModel(GEMINI_MODEL);
    } catch (err) {
      const m = err instanceof Error ? err.message : '';
      if (!isRateLimitError(m)) throw err;
      console.warn(`[SusanAI] ${GEMINI_MODEL} rate-limited, retrying with ${GEMINI_FALLBACK_MODEL}`);
      result = await sendWithModel(GEMINI_FALLBACK_MODEL);
    }
    const response = result.response;
    console.log('[SusanAI] Raw response:', response);

    const functionCall = response.functionCalls()?.[0];
    let text: string | undefined;
    try {
      text = response.text() || undefined;
    } catch (e) {
      console.warn('[SusanAI] No text part in response:', e);
    }

    // Store response in history
    chatHistory.push({
      role: 'model',
      parts: functionCall ? [{ functionCall }] : [{ text: text ?? '' }],
    });

    // Keep history manageable (last 20 exchanges)
    if (chatHistory.length > 40) {
      chatHistory = chatHistory.slice(-40);
    }

    return { text, functionCall };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Susan AI error:', msg);

    // Remove the failed message from history
    chatHistory.pop();

    if (msg.includes('API_KEY_INVALID')) {
      return { error: '🤖 MrDNX, parece que tu API key de Gemini no es válida. Verifica en Settings > AI Configuration.' };
    }
    if (isRateLimitError(msg)) {
      return { error: '🤖 Se agotó la cuota de la API por ahora (rate limit del free tier). Espera ~1 minuto e intenta de nuevo, MrDNX.' };
    }

    return { error: `🤖 Tuve un problema técnico: ${msg}. Intenta de nuevo, MrDNX.` };
  }
}

/**
 * Send a function response back to Susan
 */
export async function sendFunctionResponseToSusan(
  functionName: string,
  responseObj: any
): Promise<ChatResponse> {
  if (!genAI) return { error: 'AI not configured' };

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SUSAN_SYSTEM_PROMPT,
    tools: [{ functionDeclarations: SUSAN_TOOLS }]
  });

  // Add function response to history
  chatHistory.push({
    role: 'user',
    parts: [{
      functionResponse: {
        name: functionName,
        response: responseObj
      }
    }]
  });

  try {
    const chat = model.startChat({
      history: chatHistory.slice(0, -1),
    });

    const result = await chat.sendMessage([{
      functionResponse: {
        name: functionName,
        response: responseObj
      }
    }]);

    const response = result.response;
    const functionCall = response.functionCalls()?.[0];
    let text: string | undefined;
    try {
      text = response.text() || undefined;
    } catch (e) {
      text = undefined;
    }

    chatHistory.push({
      role: 'model',
      parts: functionCall ? [{ functionCall }] : [{ text: text ?? '' }],
    });

    return { text, functionCall };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Susan AI function response error:', msg);
    chatHistory.pop();
    return { error: `🤖 Error al procesar la respuesta de la función: ${msg}` };
  }
}

/**
 * Generate a morning briefing
 */
export async function generateMorningBriefing(context: SusanContext): Promise<string> {
  const res = await chatWithSusan(
    'Give me my morning briefing. Summarize what I have planned for today, which projects need attention, and what I should focus on first. Be specific and actionable.',
    context
  );
  return res.text || res.error || 'No response';
}

/**
 * Analyze productivity and detect procrastination
 */
export async function analyzeProductivity(context: SusanContext): Promise<ProductivityAnalysis> {
  if (!genAI) {
    return {
      score: 0,
      level: 'critical',
      summary: 'AI not configured',
      tips: ['Configure your Gemini API key in Settings'],
      procrastinationRisk: 0,
    };
  }

  const model = genAI.getGenerativeModel({
    model: GEMINI_FALLBACK_MODEL, // lite model: cheaper quota for background analysis
    systemInstruction: `You are a productivity analyzer. Respond ONLY with valid JSON matching this exact schema:
{
  "score": <number 0-100>,
  "level": "<excellent|good|needs_improvement|critical>",
  "summary": "<2-3 sentence summary>",
  "tips": ["<tip1>", "<tip2>", "<tip3>"],
  "procrastinationRisk": <number 0-100>,
  "suggestedNextTask": "<specific task name or null>"
}
Do not include any text outside the JSON.`,
  });

  const contextStr = buildContextString(context);

  try {
    const result = await model.generateContent(
      `Analyze the following productivity data and provide your assessment:\n\n${contextStr}`
    );

    const text = result.response.text().trim();
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ProductivityAnalysis;
    }

    throw new Error('No valid JSON in response');
  } catch (error) {
    console.error('Productivity analysis error:', error);
    return {
      score: 50,
      level: 'needs_improvement',
      summary: 'Unable to analyze productivity at this time.',
      tips: ['Keep logging your progress regularly', 'Set specific daily goals'],
      procrastinationRisk: 50,
    };
  }
}

/**
 * Generate a weekly report
 */
export async function generateWeeklyReport(context: SusanContext): Promise<string> {
  const res = await chatWithSusan(
    'Generate my weekly productivity report. Include: tasks completed, projects advanced, time logged, areas where I procrastinated, and specific recommendations for next week. Format it clearly with sections.',
    context
  );
  return res.text || res.error || 'No response';
}

/**
 * Get a quick motivational nudge based on current state
 */
export async function getMotivationalNudge(context: SusanContext): Promise<string> {
  const res = await chatWithSusan(
    'Give me a quick, specific motivational nudge based on my current progress. Keep it under 50 words. Be direct.',
    context
  );
  return res.text || res.error || 'No response';
}

/**
 * Parse a natural language task description into structured data
 */
export async function parseNaturalLanguageTask(
  input: string
): Promise<{
  title: string;
  dueDate?: string;
  priority?: number;
  projectName?: string;
} | null> {
  if (!genAI) return null;

  const model = genAI.getGenerativeModel({
    model: GEMINI_FALLBACK_MODEL, // lite model: cheaper quota for quick parsing
    systemInstruction: `Parse the user's natural language task description into structured data. Respond ONLY with valid JSON:
{
  "title": "<task title>",
  "dueDate": "<ISO 8601 date string or null>",
  "priority": <1-5 or null>,
  "projectName": "<project name if mentioned, or null>"
}
Today's date is ${new Date().toISOString().split('T')[0]}.
Do not include any text outside the JSON.`,
  });

  try {
    const result = await model.generateContent(input);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Clear the conversation history (for new sessions)
 */
export function clearConversationHistory(): void {
  chatHistory = [];
}
