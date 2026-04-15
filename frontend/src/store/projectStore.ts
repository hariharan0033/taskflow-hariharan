import { create } from 'zustand';
import type { Project, PaginationMeta, PaginationParams } from '../types';
import * as projectsApi from '../api/projects';

interface ProjectState {
  projects: Project[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  fetchProjects: (params?: PaginationParams) => Promise<void>;
  addProject: (data: { name: string; description?: string }) => Promise<Project>;
  editProject: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  pagination: null,
  loading: false,
  error: null,

  fetchProjects: async (params) => {
    set({ loading: true, error: null });
    try {
      const { data, pagination } = await projectsApi.getProjects(params);
      set({ projects: data, pagination, loading: false });
    } catch {
      set({ error: 'Failed to load projects', loading: false });
    }
  },

  addProject: async (data) => {
    const project = await projectsApi.createProject(data);
    set((s) => ({ projects: [project, ...s.projects] }));
    return project;
  },

  editProject: async (id, data) => {
    const updated = await projectsApi.updateProject(id, data);
    set((s) => ({ projects: s.projects.map((p) => (p.id === id ? updated : p)) }));
  },

  removeProject: async (id) => {
    await projectsApi.deleteProject(id);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },
}));
