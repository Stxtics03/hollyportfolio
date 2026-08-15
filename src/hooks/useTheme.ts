import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'shrestha-exe:theme';

/** What the OS asks for, when the visitor has never chosen. */
export function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    // Storage disabled (private mode, blocked cookies): fall back to the OS.
    return null;
  }
}

/**
 * The single DOM write that changes the theme. Every `--color-*` variable
 * hangs off this attribute, so this one line *is* the theme swap — no React
 * render is required to repaint the site in the other palette.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Nothing to do — the choice simply won't survive a reload.
  }
}

/**
 * Theme state.
 *
 * IMPORTANT: this is owned by `ThemeToggle` alone, not by the app root. The
 * theme is expressed entirely in CSS variables, so the only component that
 * needs to re-render when it changes is the button drawing the sun/moon.
 * Hoisting this to `App` meant a theme change re-rendered the whole tree —
 * and because the swap runs inside `startViewTransition`, that render landed
 * in the middle of the transition's capture and made the wipe stutter.
 *
 * The document attribute is set before first paint by an inline script in
 * `index.html`, so this hook seeds itself from the DOM rather than deciding
 * again and causing a flash of the wrong palette.
 */
export function useTheme(): { theme: Theme; setTheme: (next: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(() => {
    const applied = document.documentElement.dataset.theme;
    if (applied === 'light' || applied === 'dark') return applied;
    return storedTheme() ?? systemTheme();
  });

  // Keep following the OS until the visitor states a preference of their own.
  useEffect(() => {
    if (storedTheme()) return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (event: MediaQueryListEvent) => {
      const next: Theme = event.matches ? 'light' : 'dark';
      applyTheme(next);
      setThemeState(next);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    persistTheme(next);
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
