export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'puasa-sunnah-theme';
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';

export const parseTheme = (value: string | null): Theme | null => {
  return value === 'light' || value === 'dark' ? value : null;
};

export const resolveTheme = (
  storedTheme: Theme | null,
  systemPrefersDark: boolean,
): Theme => {
  return storedTheme ?? (systemPrefersDark ? 'dark' : 'light');
};

export const readStoredTheme = (): Theme | null => {
  try {
    return parseTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
};

export const writeStoredTheme = (theme: Theme): void => {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme still applies for this page when storage is unavailable.
  }
};

export const getSystemTheme = (): Theme => {
  if (typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return resolveTheme(null, window.matchMedia(THEME_MEDIA_QUERY).matches);
};

export const getInitialTheme = (): Theme => {
  const appliedTheme = parseTheme(
    document.documentElement.dataset.theme ?? null,
  );
  return appliedTheme ?? resolveTheme(readStoredTheme(), getSystemTheme() === 'dark');
};

export const applyTheme = (theme: Theme): void => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};
