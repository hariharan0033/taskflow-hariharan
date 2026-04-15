const STORAGE_KEY = 'theme';
type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  // Respect OS preference on first visit
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply before first render to avoid flash
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

import { create } from 'zustand';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,

  toggle: () => {
    const next: Theme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },
}));
