import { useT } from '../../i18n';
import { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { useProjectStore } from '../../store/useProjectStore';
import { Button } from '../ui';
import type { ProgressLog } from '../../types';

export function ProgressLogger({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const t = useT();
  const { db } = useDatabase();
  const addLog = useProjectStore(s => s.addProgressLog);
  
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<ProgressLog['mood']>('focused');
  const [hours, setHours] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !db) return;
    
    setIsSubmitting(true);
    try {
      const log = await db.createProgressLog({
        project_id: projectId,
        content,
        mood,
        log_type: 'update',
        hours_worked: hours ? parseFloat(hours) : undefined
      });
      addLog(log);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const moods = [
    { value: 'focused', emoji: '🎯' },
    { value: 'productive', emoji: '🚀' },
    { value: 'neutral', emoji: '😐' },
    { value: 'struggling', emoji: '😫' },
    { value: 'procrastinating', emoji: '📱' }
  ];

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <textarea 
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={t('logs.placeholder')}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          minHeight: '80px',
          outline: 'none'
        }}
        required
      />
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('logs.mood')}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {moods.map(m => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMood(m.value as ProgressLog['mood'])}
                style={{
                  background: mood === m.value ? 'var(--bg-surface)' : 'transparent',
                  border: '1px solid',
                  borderColor: mood === m.value ? 'var(--accent-primary)' : 'transparent',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.25rem'
                }}
                title={m.value}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('logs.hours')}</label>
          <input 
            type="number" 
            step="0.5"
            min="0"
            value={hours}
            onChange={e => setHours(e.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              width: '100px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
        <Button variant="ghost" onClick={onClose} type="button">{t('common.cancel')}</Button>
        <Button variant="primary" type="submit" loading={isSubmitting}>{t('logs.save')}</Button>
      </div>
    </form>
  );
}
