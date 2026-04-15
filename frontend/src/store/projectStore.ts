import { create } from 'zustand';
import type { Project } from '../types';
import * as projectsApi from '../api/projects';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (data: { name: string; description?: string }) => Promise<Project>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectsApi.getProjects();
      set({ projects, loading: false });
    } catch {
      set({ error: 'Failed to load projects', loading: false });
    }
  },

  addProject: async (data) => {
    const project = await projectsApi.createProject(data);
    set((s) => ({ projects: [project, ...s.projects] }));
    return project;
  },
}));
