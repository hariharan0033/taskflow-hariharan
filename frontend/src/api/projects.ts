import api from './axios';
import type { Project } from '../types';

export const getProjects = () =>
  api.get<Project[]>('/projects').then((r) => r.data);

export const createProject = (data: { name: string; description?: string }) =>
  api.post<Project>('/projects', data).then((r) => r.data);

export const getProject = (id: string) =>
  api.get<Project & { tasks: import('../types').Task[] }>(`/projects/${id}`).then((r) => r.data);

export const updateProject = (id: string, data: { name?: string; description?: string }) =>
  api.patch<Project>(`/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: string) =>
  api.delete(`/projects/${id}`);
