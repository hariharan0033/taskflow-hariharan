import { create } from 'zustand';
import type { Task } from '../types';
import type { TaskFilters, TaskPayload } from '../api/tasks';
import * as tasksApi from '../api/tasks';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string, filters?: TaskFilters) => Promise<void>;
  addTask: (projectId: string, data: TaskPayload) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<TaskPayload>) => Promise<void>;
  updateTaskOptimistic: (taskId: string, data: Partial<TaskPayload>) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId, filters) => {
    set({ loading: true, error: null });
    try {
      const tasks = await tasksApi.getTasks(projectId, filters);
      set({ tasks, loading: false });
    } catch {
      set({ error: 'Failed to load tasks', loading: false });
    }
  },

  addTask: async (projectId, data) => {
    const task = await tasksApi.createTask(projectId, data);
    set((s) => ({ tasks: [task, ...s.tasks] }));
    return task;
  },

  updateTask: async (taskId, data) => {
    const updated = await tasksApi.updateTask(taskId, data);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)),
    }));
  },

  // Optimistic update: apply immediately, revert on failure
  updateTaskOptimistic: async (taskId, data) => {
    const prev = get().tasks;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
    }));
    try {
      const updated = await tasksApi.updateTask(taskId, data);
      set((s) => ({
        tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)),
      }));
    } catch {
      set({ tasks: prev });
      throw new Error('Failed to update task');
    }
  },

  removeTask: async (taskId) => {
    await tasksApi.deleteTask(taskId);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
  },
}));
