'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ListThemeProvider, useListTheme } from '@/contexts/ListThemeContext'
import { Plus, List, MagnifyingGlass, X } from '@phosphor-icons/react'

// IconCustom for IO badge
function IconCustom({ name, size = 16, style = {} }: { name: string; size?: number; style?: React.CSSProperties }) {
  if (name === 'io-star') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={style.fill || 'var(--c-goal)'} />
      </svg>
    )
  }
  return null
}
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showSearchInput, setShowSearchInput] = useState(false)
  const { economy, avatar, bgColor, bgImage, habitsSearchQuery, plan, habits, setHabitsSearchQuery, setHabitsFormOpen, habitsFormOpen, themeMode } = useAppStore()
  const { currentColor } = useListTheme()

  const isHabitsPage = pathname === '/dashboard/habits'
  const showSearch = isHabitsPage
  const searchValue = isHabitsPage ? habitsSearchQuery : ''
  const canAdd = plan === 'pro' || habits.length < 10

  return (
    <ListThemeProvider>
      <SidebarProvider defaultOpen={false}>
        <DashboardSidebar />
        <SidebarInset>
          <header className="fixed top-0 left-0 right-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b text-foreground bg-background md:relative md:bg-transparent">
          <div className="flex items-center gap-2 px-2 sm:px-4 flex-1">
            <SidebarTrigger className="ml-1 text-zinc-900 p-2 border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all" style={{ backgroundColor: currentColor }}>
              <List size={20} />
            </SidebarTrigger>
            {/* Search and add buttons - only on habits page */}
            {pathname === '/dashboard/habits' && (
              <div className="relative ml-2 flex items-center gap-2">
                <button
                  onClick={() => setShowSearchInput(!showSearchInput)}
                  className="inline-flex items-center justify-center p-2 border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all text-black"
                  style={{ backgroundColor: currentColor }}
                >
                  {showSearchInput ? <X size={16} weight="bold" className="text-black" /> : <MagnifyingGlass size={16} weight="bold" className="text-black" />}
                </button>
                {showSearchInput && (
                  <input
                    autoFocus
                    placeholder="Buscar..."
                    value={searchValue}
                    onChange={(e) => {
                      setHabitsSearchQuery(e.target.value)
                    }}
                    className="w-40 h-10 px-3 py-2 text-sm border-2 border-black rounded-[8px] focus:outline-none"
                    style={{ background: themeMode === 'dark' ? '#1E1E1E' : '#fff', color: themeMode === 'dark' ? '#fff' : '#111' }}
                  />
                )}
                <button
                  onClick={() => setHabitsFormOpen(!habitsFormOpen)}
                  disabled={!canAdd}
                  className="inline-flex items-center justify-center p-2 border-2 border-black rounded-[8px] shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50 transition-all text-black"
                  style={{
                    backgroundColor: currentColor,
                    opacity: canAdd ? 1 : 0.4,
                  }}
                >
                  <Plus size={16} weight="bold" className="text-black" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6">
            <Link href="/dashboard/progress">
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 4,
                background: 'var(--background)',
                border: '1.5px solid var(--c-goal)',
                boxShadow: '2px 2px 0 var(--border)',
                fontSize: 11, fontWeight: 700,
              }}>
                <IconCustom name="io-star" size={11} style={{ fill: 'var(--c-goal)' }} />
                <span style={{ color: 'var(--c-goal)' }}>{economy.saldo_io} IO</span>
              </span>
            </Link>
            <Link href="/dashboard/profile">
               <div style={{
                 width: 72, height: 72, borderRadius: 4,
                 border: '3px solid var(--c-goal-b,#92400E)',
                 background: bgColor,
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: 36, cursor: 'pointer', flexShrink: 0, position: 'relative',
                 boxShadow: 'var(--shadow-nb,4px 4px 0 #1a1814)',
               }}>
                 {bgImage && (
                   <img src={bgImage} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
                 )}
                 {!bgImage && avatar}
               </div>
             </Link>
          </div>
          </header>
          <main className="flex-1 md:pt-0 pt-14">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ListThemeProvider>
  )
}