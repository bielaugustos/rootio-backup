'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import {
  Briefcase,
  Rocket, Robot, ShoppingBag, ChatCircle, DotsNine,
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
const ProgressIcon = ({ size = 18, weight = 'regular', className = '', color = 'currentColor' }: { size?: number; weight?: string; className?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className} style={{ color }}>
    <path d="M230.9,73.6A15.85,15.85,0,0,0,212,77.39l-33.67,36.29-35.8-80.29a1,1,0,0,1,0-.1,16,16,0,0,0-29.06,0,1,1,0,0,1,0,.1l-35.8,80.29L44,77.39A16,16,0,0,0,16.25,90.81c0,.11,0,.21.07.32L39,195a16,16,0,0,0,15.72,13H201.29A16,16,0,0,0,217,195L239.68,91.13c0-.11,0-.21.07-.32A15.85,15.85,0,0,0,230.9,73.6ZM201.35,191.68l-.06.32H54.71l-.06-.32L32,88l.14.16,42,45.24a8,8,0,0,0,13.18-2.18L128,40l40.69,91.25a8,8,0,0,0,13.18,2.18l42-45.24L224,88Z"></path>
  </svg>
)

const HomeIcon = ({ size = 18, weight = 'regular', className = '', color = 'currentColor' }: { size?: number; weight?: string; className?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} style={{ color }}>
    <path d="M2 8l7-6 7 6v8H2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
  </svg>
)

const HabitsIcon = ({ size = 18, weight = 'regular', className = '', color = 'currentColor' }: { size?: number; weight?: string; className?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} style={{ color }}>
    <rect x="2" y="2" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
  </svg>
)

const FinanceIcon = ({ size = 18, weight = 'regular', className = '', color = 'currentColor' }: { size?: number; weight?: string; className?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} style={{ color }}>
    <path d="M9 2v14M4 6h8M3 11h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
)

const ProfileIcon = ({ size = 18, weight = 'regular', className = '', color = 'currentColor' }: { size?: number; weight?: string; className?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className} style={{ color }}>
    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M3 16c1-3 3-5 6-5s5 2 6 5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
)

const DotsNineIcon = ({ size = 18, strokeWidth = 2, className = '', color = 'currentColor' }: { size?: number; strokeWidth?: number; className?: string; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ color }}>
    <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="4" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="20" cy="4" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="20" cy="12" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="4" cy="20" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
    <circle cx="20" cy="20" r="2" stroke="currentColor" strokeWidth={strokeWidth} />
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
          title: 'Hoje',
          url: '/dashboard',
          icon: HomeIcon,
        },
        {
          title: 'Experiência',
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
      icon: (props: any) => <DotsNineIcon {...props} strokeWidth={2} />,
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
          title: 'Ajustes',
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
  const isDark = themeMode === 'dark'
  const iconColor = isDark ? '#ffffff' : '#000000'

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <img 
                    src={themeMode === 'dark' ? "/logod.svg" : "/logo.svg"} 
                    alt="IO" 
                    className="size-4" 
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-foreground">IO Dashboard</span>
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
               <Link href={item.url} className="font-medium flex items-center gap-3" style={{ color: isDark ? '#ffffff' : '#000000' }}>
                 <GroupIcon size={18} className="shrink-0" color={isDark ? '#ffffff' : '#000000'} />
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
                               <Link href={subItem.url} className="flex items-center gap-3" style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                 <Icon size={16} className="shrink-0" color={isDark ? '#ffffff' : '#000000'} />
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
