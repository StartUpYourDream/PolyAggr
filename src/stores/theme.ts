import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        updateDOMTheme(theme)
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
        updateDOMTheme(newTheme)
      },
    }),
    {
      name: 'probdata-theme',
      onRehydrateStorage: () => (state) => {
        // Apply theme to DOM when store is rehydrated
        if (state) {
          updateDOMTheme(state.theme)
        }
      },
    }
  )
)

function updateDOMTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}

// Initialize theme on first load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('probdata-theme')
  if (stored) {
    try {
      const { state } = JSON.parse(stored)
      updateDOMTheme(state.theme)
    } catch (e) {
      updateDOMTheme('dark')
    }
  } else {
    updateDOMTheme('dark')
  }
}
