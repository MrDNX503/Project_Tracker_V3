import { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { useDatabase } from '../../hooks/useDatabase';
import { ProjectCard } from '../dashboard/ProjectCard';
import { ProjectForm } from './ProjectForm';
import { Button, Input, Skeleton } from '../ui';
import { Search, Plus, Filter } from 'lucide-react';

export function ProjectsView() {
  const { db } = useDatabase();
  const projects = useProjectStore((s) => s.projects);
  const tasks = useProjectStore((s) => s.tasks);
  const loading = useProjectStore((s) => s.loading);
  const setProjects = useProjectStore((s) => s.setProjects);
  const setLoading = useProjectStore((s) => s.setLoading);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      if (!db) return;
      setLoading(true);
      try {
        const p = await db.listProjects({});
        setProjects(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [db, setProjects, setLoading]);

  useEffect(() => {
    const handleOpenForm = () => setIsFormOpen(true);
    window.addEventListener('open-new-project-modal', handleOpenForm);
    return () => window.removeEventListener('open-new-project-modal', handleOpenForm);
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem', height: '100%' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Projects</h1>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsFormOpen(true)}>
          New Project
        </Button>
      </header>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 300px' }}>
          <Input 
            placeholder="Search projects..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} color="var(--text-secondary)" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', flex: 1, alignContent: 'start' }}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} type="card" height="200px" />)
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              tasks={tasks.filter(t => t.project_id === project.id)} 
            />
          ))
        ) : (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>📂</div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>No projects found</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {projects.length === 0 ? "You haven't created any projects yet." : "No projects match your filters."}
            </p>
            {projects.length === 0 && (
              <Button variant="primary" onClick={() => setIsFormOpen(true)} style={{ marginTop: '1rem' }}>
                Create your first project
              </Button>
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <ProjectForm 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
