import { useState, useRef, useEffect } from 'react';
import { useSusan } from '../../hooks/useSusan';
import { SusanAvatar } from './SusanAvatar';
import { ChatBubble } from './ChatBubble';
import { SusanInsights } from './SusanInsights';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useT } from '../../i18n';
import { Button, Input } from '../ui';
import { Send, Sunrise, Activity, Zap, Check, X } from 'lucide-react';
import { CalendarAPI } from '../../services/calendarAPI';
import { useDatabase } from '../../hooks/useDatabase';
import { useProjectStore } from '../../store/useProjectStore';

export function SusanView() {
  const { messages, isThinking, sendMessage, getMorningBriefing, analyzeProductivity, isConfigured, handleFunctionResponse } = useSusan();
  const { db } = useDatabase();
  const setProjects = useProjectStore((s) => s.setProjects);
  const [inputValue, setInputValue] = useState('');
  const [executingCall, setExecutingCall] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isThinking || !isConfigured) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const executeFunction = async (msgId: string, call: any) => {
    setExecutingCall(msgId);
    try {
      if (call.name === 'createProject') {
        const { name, description } = call.args;
        if (db) {
          await db.createProject({
            name,
            description,
            icon: '🚀',
            color: '#8b5cf6',
            status: 'planning',
            priority: 3
          });
          // Refresh projects
          const p = await db.listProjects({});
          setProjects(p);
        }
        await handleFunctionResponse(call.name, { status: 'success', message: 'Project created successfully' });
      } else if (call.name === 'scheduleCalendarEvent') {
        const { title, startTime, endTime, description } = call.args;
        if (!CalendarAPI.hasToken()) {
          throw new Error('Google Calendar not connected');
        }
        const event = await CalendarAPI.createEvent(title, new Date(startTime), new Date(endTime), description);
        await handleFunctionResponse(call.name, { status: 'success', eventId: event.id, link: event.htmlLink });
      } else {
        await handleFunctionResponse(call.name, { status: 'error', message: 'Function not implemented' });
      }
    } catch (error) {
      await handleFunctionResponse(call.name, { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setExecutingCall(null);
    }
  };

  const rejectFunction = async (msgId: string, call: any) => {
    setExecutingCall(msgId);
    await handleFunctionResponse(call.name, { status: 'rejected', message: 'User denied permission' });
    setExecutingCall(null);
  };

  const t = useT();
  const isMobile = useMediaQuery('(max-width: 900px)');

  return (
    <div style={{ display: 'flex', gap: isMobile ? '0' : '2rem', height: '100%', padding: isMobile ? '0' : '1rem', minHeight: 0 }}>
      {/* Main Chat Area */}
      <div className="glass-card" style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ padding: isMobile ? '0.75rem 1rem' : '1.5rem', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <SusanAvatar state={isThinking ? 'thinking' : 'idle'} size={48} />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Susan AI</h1>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {isConfigured ? t('susan.subtitle') : t('susan.notconfigured')}
            </p>
          </div>
        </header>

        {/* Quick Actions */}
        {isConfigured && (
          <div style={{ padding: isMobile ? '0.5rem 1rem' : '1rem 1.5rem', display: 'flex', gap: '0.75rem', overflowX: 'auto', borderBottom: '1px solid var(--border-default)' }}>
            <Button variant="secondary" size="sm" icon={<Sunrise size={14} />} onClick={() => getMorningBriefing()}>{t('susan.briefing')}</Button>
            <Button variant="secondary" size="sm" icon={<Activity size={14} />} onClick={() => analyzeProductivity()}>{t('susan.analyze')}</Button>
            <Button variant="secondary" size="sm" icon={<Zap size={14} />} onClick={() => sendMessage('Give me a quick motivational nudge')}>{t('susan.motivate')}</Button>
          </div>
        )}

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1rem' : '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          {messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-secondary)', maxWidth: '400px' }}>
              <SusanAvatar state="idle" size={80} style={{ margin: '0 auto 1rem auto' }} />
              <h3>{t('susan.greeting')}</h3>
              <p>{t('susan.greeting.desc')}</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id || index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <ChatBubble message={msg} />
                {msg.functionCall && (
                  <div style={{ 
                    alignSelf: 'flex-start', 
                    marginLeft: '3rem', 
                    padding: '1rem', 
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '400px'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={16} /> 
                      Susan requests permission:
                    </h4>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
                      <strong>Action:</strong> {msg.functionCall.name}<br/>
                      <strong>Details:</strong> {JSON.stringify(msg.functionCall.args, null, 2)}
                    </p>
                    {/* Hide buttons if we already responded to this message in history */}
                    {index === messages.length - 1 && !isThinking ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          icon={<Check size={14} />} 
                          onClick={() => executeFunction(msg.id!, msg.functionCall)}
                          disabled={executingCall === msg.id}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          icon={<X size={14} />} 
                          onClick={() => rejectFunction(msg.id!, msg.functionCall)}
                          disabled={executingCall === msg.id}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Action resolved
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          {isThinking && (
            <div style={{ alignSelf: 'flex-start', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
              <div className="loading-dots"><span></span><span></span><span></span></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: isMobile ? '0.75rem' : '1.5rem', borderTop: '1px solid var(--border-default)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: isMobile ? '0.5rem' : '1rem' }}>
            <div style={{ flex: 1 }}>
              <Input 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isConfigured ? t('susan.placeholder') : t('susan.noapikey')}
                disabled={!isConfigured || isThinking}
              />
            </div>
            <Button 
              type="submit" 
              variant="primary" 
              icon={<Send size={18} />} 
              disabled={!inputValue.trim() || isThinking || !isConfigured}
            >
              {t('susan.send')}
            </Button>
          </form>
        </div>
      </div>

      {/* Side Panel: Insights (hidden on mobile — chat takes full width) */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', minWidth: '300px', maxWidth: '400px' }}>
          <SusanInsights />
        </div>
      )}
    </div>
  );
}
