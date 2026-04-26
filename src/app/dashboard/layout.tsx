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
  const { economy, avatar, bgColor, bgImage, habitsSearchQuery, plan, habits, setHabitsSearchQuery, setHabitsFormOpen } = useAppStore()
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
              <div className="relative flex-1 ml-2 sm:ml-4 flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    autoFocus
                    placeholder="Buscar..."
                    value={searchValue}
                    onChange={(e) => {
                      setHabitsSearchQuery(e.target.value)
                    }}
                    className="w-full px-2 sm:px-3 py-1.5 text-xs sm:text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <MagnifyingGlass size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={() => setHabitsFormOpen(true)}
                  disabled={!canAdd}
                  style={{
                    padding:'6px 12px',
                    background:'#F59E0B',
                    color:'#111',
                    border:'2px solid #111',
                    boxShadow:'2px 2px 0 0 #111',
                    borderRadius:0,
                    fontFamily:'var(--font-body,sans-serif)',
                    fontWeight:700,
                    fontSize:11,
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    opacity: canAdd ? 1 : 0.4,
                  }}
                >
                  <Plus size={16} weight="bold" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4">
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
