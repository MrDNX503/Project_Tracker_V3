// ============================================
// Project State Store (Zustand)
// ============================================

import { create } from 'zustand';
import type { Project, Task, Milestone, ProgressLog } from '../types';

interface ProjectState {
  // Data
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  milestones: Milestone[];
  progressLogs: ProgressLog[];

  // Loading states
  loading: boolean;
  saving: boolean;

  // Filters
  statusFilter: string | null;
  priorityFilter: number | null;
  searchQuery: string;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setMilestones: (milestones: Milestone[]) => void;
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  removeMilestone: (id: string) => void;
  setProgressLogs: (logs: ProgressLog[]) => void;
  addProgressLog: (log: ProgressLog) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setStatusFilter: (status: string | null) => void;
  setPriorityFilter: (priority: number | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  milestones: [],
  progressLogs: [],
  loading: false,
  saving: false,
  statusFilter: null,
  priorityFilter: null,
  searchQuery: '',

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  addProject: (project) =>
    set((s) => ({ projects: [project, ...s.projects] })),
  updateProject: (id, updates) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        s.currentProject?.id === id
          ? { ...s.currentProject, ...updates }
          : s.currentProject,
    })),
  removeProject: (id) =>
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProject: s.currentProject?.id === id ? null : s.currentProject,
    })),
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  setMilestones: (milestones) => set({ milestones }),
  addMilestone: (milestone) =>
    set((s) => ({ milestones: [...s.milestones, milestone] })),
  updateMilestone: (id, updates) =>
    set((s) => ({
      milestones: s.milestones.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  removeMilestone: (id) =>
    set((s) => ({ milestones: s.milestones.filter((m) => m.id !== id) })),
  setProgressLogs: (logs) => set({ progressLogs: logs }),
  addProgressLog: (log) =>
    set((s) => ({ progressLogs: [log, ...s.progressLogs] })),
  setLoading: (loading) => set({ loading }),
  setSaving: (saving) => set({ saving }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
