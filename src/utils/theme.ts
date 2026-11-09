export type Theme = 'light';

export function getInitialTheme(): Theme {
  return 'light';
}

export function applyTheme(_theme?: string): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('dark');
  root.classList.add('light');

  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', '#f8fafc');
  }

  try {
    localStorage.setItem('jedalnicek_theme', 'light');
  } catch (e) {
    console.warn(e);
  }
}
