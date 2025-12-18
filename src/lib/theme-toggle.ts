export function initializeThemeToggle() {
  const toggleButton = document.getElementById('theme-toggle');
  const toggleButtonDesktop = document.getElementById('theme-toggle-desktop');

  const handleToggle = () => {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (toggleButton) {
    toggleButton.addEventListener('click', handleToggle);
  }

  if (toggleButtonDesktop) {
    toggleButtonDesktop.addEventListener('click', handleToggle);
  }
}
