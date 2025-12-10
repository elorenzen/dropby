/**
 * Theme Management Composable
 * Easy light/dark mode switching for DropBy
 */

export const useTheme = () => {
  const isDark = ref(false)

  // Define updateTheme function first
  const updateTheme = () => {
    if (process.client) {
      const html = document.documentElement
      if (isDark.value) {
        html.classList.add('p-dark')
      } else {
        html.classList.remove('p-dark')
      }
    }
  }

  // Initialize theme from localStorage or system preference
  onMounted(() => {
    const stored = localStorage.getItem('dropby-theme')
    if (stored) {
      isDark.value = stored === 'dark'
    } else {
      // Check system preference
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  })
  
  // Also try to initialize immediately if DOM is ready
  if (process.client && typeof document !== 'undefined') {
    const stored = localStorage.getItem('dropby-theme')
    if (stored) {
      isDark.value = stored === 'dark'
      updateTheme()
    }
  }

  // Watch for system preference changes
  if (process.client) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('dropby-theme')) {
        isDark.value = e.matches
        updateTheme()
      }
    })
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('dropby-theme', isDark.value ? 'dark' : 'light')
    updateTheme()
    console.log('Theme toggled:', isDark.value ? 'dark' : 'light')
    console.log('HTML classes:', document.documentElement.classList.toString())
    // Force a small delay to ensure DOM updates
    if (process.client) {
      setTimeout(() => {
        const html = document.documentElement
        console.log('Surface ground value:', getComputedStyle(html).getPropertyValue('--p-surface-ground'))
        console.log('Surface 900 value:', getComputedStyle(html).getPropertyValue('--p-surface-900'))
      }, 100)
    }
  }

  const setTheme = (theme: 'light' | 'dark') => {
    isDark.value = theme === 'dark'
    localStorage.setItem('dropby-theme', theme)
    updateTheme()
  }

  return {
    isDark: computed(() => isDark.value),
    toggleTheme,
    setTheme
  }
}

