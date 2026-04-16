import api from './axios';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export const getUsers = () =>
  api.get<{ users: UserSummary[] }>('/users').then((r) => r.data.users);
