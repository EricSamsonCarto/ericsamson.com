const applyTheme = (theme: 'dark' | 'light'): void => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
};

export function initializeThemeToggle(): void {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  });
}
