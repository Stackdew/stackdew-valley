export const initThemeSwitcher = () => {
  const toggleBtn = document.getElementById('theme-toggle')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && prefersDark)
  ) {
    document.documentElement.setAttribute('data-theme', 'dark')
    if (toggleBtn) toggleBtn.textContent = '🌙'
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme')

      if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem('theme', 'light')
        toggleBtn.textContent = '🌞'
      } else {
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('theme', 'dark')
        toggleBtn.textContent = '🌙'
      }
    })
  }
}
