'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Rocket, Robot, User, ShoppingBag, Lightning, List, X,
  CaretDown, MagnifyingGlass, ChatCircle, Bell,
} from '@phosphor-icons/react'

// Custom Progress Icon
const ProgressIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M5 2h8l-1 8H6L5 2zM4 14h10M9 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" fill="none" />
  </svg>
)

// Custom Home Icon
const HomeIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M2 8l7-6 7 6v8H2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
  </svg>
)

// Custom Habits Icon
const HabitsIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <rect x="2" y="2" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M5 9l3 3 5-5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="square" />
  </svg>
)

// Custom Finance Icon
const FinanceIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M9 2v14M4 6h8M3 11h10" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
  </svg>
)

// Custom Profile Icon
const ProfileIcon = ({ size = 18, weight = 'regular', className = '' }: { size?: number; weight?: string; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="2" />
    <path d="M3 16c1-3 3-5 6-5s5 2 6 5" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
)

type MenuItem = {
  label: string
  desc: string
  href: string
  icon: React.ComponentType<any>
}

type MenuGroup = {
  label: string
  icon: React.ComponentType<any>
  href: string
  items: MenuItem[]
}

const MENUS: MenuGroup[] = [
  { label:'Início',   icon:HomeIcon,       href:'/dashboard',
    items:[{ label:'Tela principal', desc:'Resumo do dia',       href:'/dashboard',          icon:HomeIcon },
           { label:'Progresso IO',   desc:'Nível e conquistas',  href:'/dashboard/progress', icon:ProgressIcon }] },
  { label:'Hábitos',  icon:HabitsIcon,     href:'/dashboard/habits',
    items:[{ label:'Meus hábitos',   desc:'Ver e gerenciar',     href:'/dashboard/habits',   icon:HabitsIcon }] },
  { label:'Finanças',  icon:FinanceIcon,    href:'/dashboard/finance',
    items:[{ label:'Visão geral',    desc:'Saldo e transações',  href:'/dashboard/finance',  icon:FinanceIcon }] },
  { label:'Mais',     icon:List,           href:'#',
    items:[{ label:'Carreira',       desc:'Currículo',           href:'/dashboard/career',   icon:Briefcase },
           { label:'Projetos',       desc:'Metas pessoais',      href:'/dashboard/projects', icon:Rocket },
           { label:'Mentor',         desc:'Diário e IA',         href:'/dashboard/mentor',   icon:Robot },
           { label:'Loja IO',        desc:'Recompensas',         href:'/dashboard/shop',     icon:ShoppingBag },
           { label:'Feed',           desc:'Comunidade',          href:'/dashboard/feed',     icon:ChatCircle }] },
]

const BOTTOM = [
  { href:'/dashboard',         label:'Hoje',     Icon:HomeIcon },
  { href:'/dashboard/habits',  label:'Hábitos',  Icon:HabitsIcon },
  { href:'/dashboard/finance', label:'Finanças', Icon:FinanceIcon },
  { href:'/dashboard/progress',label:'Progresso',Icon:ProgressIcon },
  { href:'/dashboard/profile', label:'Perfil',   Icon:ProfileIcon },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { economy, avatar, theme, themeMode, soundOn, bgColor, bgImage } = useAppStore()
  const [open, setOpen]   = useState<string|null>(null)
  const [mob, setMob]     = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if(navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b" ref={navRef}>
        <nav className="flex items-center h-14 px-4 gap-1 max-w-screen-xl mx-auto text-foreground">
<Link href="/dashboard" className="flex items-center gap-2 mr-4 font-semibold hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="IO" className={`w-7 h-7 ${themeMode === 'dark' ? '' : 'hidden'}`} />
            <img src="/logodark.svg" alt="IO" className={`w-7 h-7 ${themeMode === 'dark' ? 'hidden' : ''}`} />
          </Link>

          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {MENUS.map(m => (
              <div key={m.label} className="relative">
                <Button variant="ghost" size="sm" className="gap-1.5 text-foreground"
                  onClick={() => setOpen(open===m.label ? null : m.label)}>
                  <m.icon size={14} className="text-foreground" />
                  {m.label}
                  <CaretDown size={11} className={`opacity-60 transition-transform ${open===m.label?'rotate-180':''}`} />
                </Button>
                {open===m.label && (
                  <div className="absolute top-full left-0 mt-1 bg-popover border rounded-xl shadow-lg min-w-[200px] z-50 p-1 animate-slide-in-up">
                    {m.items.map((it,i) => (
                      <Link key={i} href={it.href} onClick={() => setOpen(null)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group">
                        <div className="w-8 h-8 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                          <it.icon size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium leading-none mb-0.5">{it.label}</div>
                          <div className="text-xs text-muted-foreground">{it.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/dashboard/progress">
              <div className="io-ticker"><Lightning size={8} weight="fill" />{economy.saldo_io} IO</div>
            </Link>
            <Button variant="ghost" size="icon" className="relative text-foreground">
              <Bell size={16} className="text-foreground" />
            </Button>
            <Link href="/dashboard/profile">
              <div className="w-8 h-8 rounded-full border-2 border-amber-200 hover:border-amber-400 transition-colors cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: !bgImage ? bgColor : 'transparent' }}>
                {bgImage && (
                  <img src={bgImage} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <span className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: bgColor === '#ffffff' || bgColor === '#fef3c7' ? '#000' : '#fff' }}>
                  {avatar}
                </span>
              </div>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMob(v=>!v)}>
              {mob ? <X size={18}/> : <List size={18}/>}
            </Button>
          </div>
        </nav>
        {mob && (
          <div className="md:hidden border-t bg-background animate-slide-in-up">
            <div className="p-2 flex flex-col gap-0.5 max-w-screen-xl mx-auto">
      {MENUS.flatMap(m => m.items).map((it,i) => (
        <Link key={i} href={it.href} onClick={() => setMob(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent text-foreground">
                  <it.icon size={15} className="text-amber-600" />
                  <span className="font-medium text-foreground">{it.label}</span>
                </Link>
      ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pb-20 md:pb-0 max-w-screen-xl mx-auto w-full md:px-16">{children}</main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t flex items-center justify-around px-2 py-3 z-40">
        {BOTTOM.map(({ href, label, Icon }) => {
          const act = pathname === href
          return (
            <Link key={href} href={href} className="io-nav-item flex flex-col items-center">
              <div className={`io-nav-icon ${act ? 'active' : 'hover:bg-accent'}`}>
                <Icon size={18} weight={act?'fill':'regular'} className={act?'text-white':'text-muted-foreground'} />
              </div>
              <span className={`text-[10px] font-medium ${act?'text-foreground':'text-muted-foreground'}`}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}