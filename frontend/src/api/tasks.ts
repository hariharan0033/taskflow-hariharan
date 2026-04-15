import api from './axios';
import type { Task, TaskStatus, TaskPriority } from '../types';

export interface TaskFilters {
  status?: TaskStatus;
  assignee?: string;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  due_date?: string;
}

export const getTasks = (projectId: string, filters?: TaskFilters) =>
  api.get<Task[]>(`/projects/${projectId}/tasks`, { params: filters }).then((r) => r.data);

export const createTask = (projectId: string, data: TaskPayload) =>
  api.post<Task>(`/projects/${projectId}/tasks`, data).then((r) => r.data);

export const updateTask = (taskId: string, data: Partial<TaskPayload>) =>
  api.patch<Task>(`/tasks/${taskId}`, data).then((r) => r.data);

export const deleteTask = (taskId: string) =>
  api.delete(`/tasks/${taskId}`);

export const getProjectStats = (projectId: string) =>
  api.get(`/projects/${projectId}/stats`).then((r) => r.data);
