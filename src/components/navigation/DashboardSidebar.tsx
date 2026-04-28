'use client'

import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  House,
  CheckSquare,
  CurrencyDollar,
  User,
  Target,
} from '@phosphor-icons/react'

// Navigation items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: House, href: '/dashboard' },
  { id: 'habits', label: 'Hábitos', icon: CheckSquare, href: '/dashboard/habits' },
  { id: 'finance', label: 'Finanças', icon: CurrencyDollar, href: '/dashboard/finance' },
  { id: 'progress', label: 'Progresso', icon: Target, href: '/dashboard/progress' },
  { id: 'profile', label: 'Perfil', icon: User, href: '/dashboard/profile' },
]

// Bottom navigation for mobile
const bottomItems = [
  { id: 'dashboard', label: 'Hoje', icon: House, href: '/dashboard' },
  { id: 'habits', label: 'Hábitos', icon: CheckSquare, href: '/dashboard/habits' },
  { id: 'finance', label: 'Finanças', icon: CurrencyDollar, href: '/dashboard/finance' },
  { id: 'progress', label: 'Progresso', icon: Target, href: '/dashboard/progress' },
  { id: 'profile', label: 'Perfil', icon: User, href: '/dashboard/profile' },
]

export function DashboardSidebar() {
  const { username } = useAppStore()

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-amber-500 text-black">
                  <span className="font-bold text-sm">IO</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-foreground">IO Tasks</span>
                  <span className="text-xs text-muted-foreground">{username}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <a href={item.href} className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}

// Bottom navigation component for mobile
export function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-14 items-center justify-around px-4">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-amber-500'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}