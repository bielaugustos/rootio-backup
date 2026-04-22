'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import {
  Briefcase,
  Rocket, Robot, ShoppingBag, ChatCircle,
} from '@phosphor-icons/react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

// Custom Icons
const ProgressIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M5 2h8l-1 8H6L5 2zM4 14h10M9 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
  </svg>
)

const HomeIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M2 8l7-6 7 6v8H2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
  </svg>
)

const HabitsIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="2" y="2" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
  </svg>
)

const FinanceIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M9 2v14M4 6h8M3 11h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
)

const ProfileIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M3 16c1-3 3-5 6-5s5 2 6 5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
)

const data = {
  navMain: [
    {
      title: 'Início',
      url: '/dashboard',
      icon: HomeIcon,
      items: [
        {
          title: 'Tela principal',
          url: '/dashboard',
          icon: HomeIcon,
        },
        {
          title: 'Progresso IO',
          url: '/dashboard/progress',
          icon: ProgressIcon,
        },
      ],
    },
    {
      title: 'Hábitos',
      url: '/dashboard/habits',
      icon: HabitsIcon,
      items: [
        {
          title: 'Meus hábitos',
          url: '/dashboard/habits',
          icon: HabitsIcon,
        },
      ],
    },
    {
      title: 'Finanças',
      url: '/dashboard/finance',
      icon: FinanceIcon,
      items: [
        {
          title: 'Visão geral',
          url: '/dashboard/finance',
          icon: FinanceIcon,
        },
      ],
    },
    {
      title: 'Mais',
      url: '#',
      icon: (props: any) => <div {...props}>📋</div>,
      items: [
        {
          title: 'Carreira',
          url: '/dashboard/career',
          icon: Briefcase,
        },
        {
          title: 'Projetos',
          url: '/dashboard/projects',
          icon: Rocket,
        },
        {
          title: 'Mentor',
          url: '/dashboard/mentor',
          icon: Robot,
        },
        {
          title: 'Loja IO',
          url: '/dashboard/shop',
          icon: ShoppingBag,
        },
        {
          title: 'Feed',
          url: '/dashboard/feed',
          icon: ChatCircle,
        },
      ],
    },
    {
      title: 'Perfil',
      url: '/dashboard/profile',
      icon: ProfileIcon,
      items: [
        {
          title: 'Meu perfil',
          url: '/dashboard/profile',
          icon: ProfileIcon,
        },
      ],
    },
  ],
}

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { economy, avatar, themeMode, bgColor, bgImage } = useAppStore()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <img 
                    src="/logo.svg" 
                    alt="IO" 
                    className="size-4" 
                    style={{ filter: themeMode === 'dark' ? 'invert(1) brightness(2)' : 'none' }} 
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">IO Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => {
              const GroupIcon = item.icon
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <Link href={item.url} className="font-medium flex items-center gap-3">
                      <GroupIcon size={18} className="text-amber-600 shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const Icon = subItem.icon
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
                              <Link href={subItem.url} className="flex items-center gap-3">
                                <Icon size={16} className="text-amber-600 shrink-0" />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
