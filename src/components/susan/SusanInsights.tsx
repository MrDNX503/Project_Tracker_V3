import { useSusanStore } from '../../store/useSusanStore';
import { ProgressRing } from '../ui';
import { Target, Zap, AlertTriangle, Lightbulb } from 'lucide-react';

export function SusanInsights() {
  const latestAnalysis = useSusanStore(s => s.latestAnalysis);
  const morningBriefing = useSusanStore(s => s.morningBriefing);

  if (!latestAnalysis && !morningBriefing) {
    return (
      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <Lightbulb size={48} color="var(--text-secondary)" opacity={0.5} />
        <p style={{ color: 'var(--text-secondary)' }}>
          Ask Susan for a productivity analysis or morning briefing to see insights here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {latestAnalysis && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ActivityIcon score={latestAnalysis.score} />
            Productivity Score
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
            <ProgressRing 
              progress={latestAnalysis.score} 
              size={120} 
              strokeWidth={8} 
              color={getScoreColor(latestAnalysis.score)} 
            />
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, pointerEvents: 'none' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{latestAnalysis.score}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>/100</span>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', textAlign: 'center' }}>
            {latestAnalysis.summary}
          </p>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Focus Areas</h4>
            {latestAnalysis.tips.map((s: string, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.875rem' }}>
                <Target size={16} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: 'var(--text-primary)' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {morningBriefing && (
        <div className="glass-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--accent-violet)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Morning Briefing</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
            {morningBriefing}
          </p>
        </div>
      )}

    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function ActivityIcon({ score }: { score: number }) {
  if (score >= 80) return <Zap size={20} color="var(--color-success)" />;
  if (score >= 50) return <Target size={20} color="var(--color-warning)" />;
  return <AlertTriangle size={20} color="var(--color-danger)" />;
}
