'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Plus, Lightning, List, MagnifyingGlass } from '@phosphor-icons/react'
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { economy, avatar, bgColor, bgImage, habitsSearchQuery, plan, habits, setHabitsSearchQuery, setHabitsFormOpen, themeMode } = useAppStore()
  const pathname = usePathname()

  const isHabitsPage = pathname === '/dashboard/habits'
  const showSearch = isHabitsPage
  const searchValue = isHabitsPage ? habitsSearchQuery : ''
  const canAdd = plan === 'pro' || habits.length < 10

  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b text-foreground">
          <div className="flex items-center gap-2 px-2 sm:px-4 flex-1">
            <SidebarTrigger className="-ml-1 text-foreground">
              <List size={20} />
            </SidebarTrigger>
            {showSearch && (
              <div className="relative flex-1 ml-2 hidden sm:flex items-center gap-2 bg-white dark:bg-[#1E1E1E] border-2 border-black rounded-[4px] px-2 py-1.5 shadow-sm">
                <input
                  autoFocus
                  placeholder="Buscar..."
                  value={searchValue}
                  onChange={(e) => {
                    setHabitsSearchQuery(e.target.value)
                  }}
                  className="flex-1 h-4 px-2 py-1 text-xs border-none focus:outline-none bg-transparent"
                  style={{ color: themeMode === 'dark' ? '#fff' : '#111' }}
                />
                <MagnifyingGlass size={16} style={{ color: themeMode === 'dark' ? 'rgba(255,255,255,.5)' : '#9ca3af' }} />
              </div>
            )}
            {/* Add button desktop */}
            {showSearch && (
              <button
                onClick={() => setHabitsFormOpen(true)}
                disabled={!canAdd}
                className="hidden sm:inline-flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:pointer-events-none disabled:opacity-50 transition-all duration-75 bg-white dark:bg-[#1E1E1E]"
                style={{
                  borderRadius:'0.375rem',
                  opacity: canAdd ? 1 : 0.4,
                }}
              >
                <Plus size={16} weight="bold" />
              </button>
            )}
            {/* Mobile version */}
            {showSearch && (
              <div className="relative flex-1 sm:hidden ml-2 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    autoFocus
                    placeholder="Buscar..."
                    value={searchValue}
                    onChange={(e) => {
                      setHabitsSearchQuery(e.target.value)
                    }}
                    className="w-full h-8 px-2 sm:px-3 py-1.5 text-xs border-2 border-black rounded-[4px] focus:outline-none focus:border-black"
                    style={{ background: themeMode === 'dark' ? '#1E1E1E' : '#fff', color: themeMode === 'dark' ? '#fff' : '#111' }}
                  />
                  <MagnifyingGlass size={14} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: themeMode === 'dark' ? 'rgba(255,255,255,.5)' : '#9ca3af' }} />
                </div>
                <button
                  onClick={() => setHabitsFormOpen(true)}
                  disabled={!canAdd}
                  className="inline-flex items-center justify-center border-2 border-black shadow-[2px_2px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] disabled:pointer-events-none disabled:opacity-50 transition-all duration-75 bg-white dark:bg-[#1E1E1E]"
                  style={{
                    borderRadius:'0.375rem',
                    opacity: canAdd ? 1 : 0.4,
                  }}
                >
                  <Plus size={16} weight="bold" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-6">
            <Link href="/dashboard/progress">
              <div className="io-ticker text-xs sm:text-sm"><Lightning size={3} weight="fill" />{economy.saldo_io} IO</div>
            </Link>
            <Link href="/dashboard/profile">
               <div 
                 className="w-6 h-6 sm:w-7 sm:h-7 rounded-md border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-75 cursor-pointer relative overflow-hidden"
                 style={{ backgroundColor: !bgImage ? bgColor : 'transparent' }}
               >
                {bgImage && (
                  <img src={bgImage} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <span 
                  className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-medium" 
                  style={{ color: bgColor === '#ffffff' || bgColor === '#fef3c7' ? '#000' : '#fff' }}
                >
                  {avatar}
                </span>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}