import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token });
  },

  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => !!get().token,
}));
