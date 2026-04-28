'use client'
import { useAppStore } from '@/store/useAppStore'
import { useEffect } from 'react'

const THEMES_WITH_MODES = ['nuclear', 'eclipse', 'aurora', 'neo-brutalism']

export function ThemeInitializer() {
  const theme = useAppStore(s => s.theme)
  const themeMode = useAppStore(s => s.themeMode)
  
  useEffect(() => {
    document.documentElement.classList.remove(
      'dark',
      'theme-nuclear', 'theme-nuclear-dark',
      'theme-neo-brutalism', 'theme-neo-brutalism-dark'
    )
    
    const hasMode = THEMES_WITH_MODES.includes(theme)
    
    if (hasMode) {
      if (themeMode === 'dark') {
        document.documentElement.classList.add(`theme-${theme}-dark`)
      } else {
        document.documentElement.classList.add(`theme-${theme}`)
      }
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [theme, themeMode])
  
  return null
}
