import type { Project } from '../../types';

export function ProgressChart({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>No projects to display.</p>;
  }

  // Sort by progress descending
  const sorted = [...projects].sort((a, b) => b.progress - a.progress);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {sorted.map(project => (
        <div key={project.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{project.name}</span>
            <span style={{ color: 'var(--text-secondary)' }}>{project.progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${project.progress}%`, 
                backgroundColor: project.color || 'var(--accent-primary)',
                transition: 'width 1s ease-out',
                borderRadius: '4px'
              }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}
