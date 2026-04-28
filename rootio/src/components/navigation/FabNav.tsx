'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  House, CheckSquare, CurrencyDollar,
  User, MagnifyingGlass, ArrowLeft, List, X,
  Plus, Lightning,
} from '@phosphor-icons/react'

// Progress Icon SVG
const ProgressIcon = ({ size = 15, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" className={className}>
    <path d="M230.9,73.6A15.85,15.85,0,0,0,212,77.39l-33.67,36.29-35.8-80.29a1,1,0,0,1,0-.1,16,16,0,0,0-29.06,0,1,1,0,0,1,0,.1l-35.8,80.29L44,77.39A16,16,0,0,0,16.25,90.81c0,.11,0,.21.07.32L39,195a16,16,0,0,0,15.72,13H201.29A16,16,0,0,0,217,195L239.68,91.13c0-.11,0-.21.07-.32A15.85,15.85,0,0,0,230.9,73.6ZM201.35,191.68l-.06.32H54.71l-.06-.32L32,88l.14.16,42,45.24a8,8,0,0,0,13.18-2.18L128,40l40.69,91.25a8,8,0,0,0,13.18,2.18l42-45.24L224,88Z"></path>
  </svg>
)

// ─── Tipos ────────────────────────────────────────────────
interface FabItem {
  label:    string
  icon:     React.ReactNode
  href?:    string
  action?:  () => void
  variant?: 'primary' | 'secondary'  // primary = amber cheio, secondary = amber claro
}

interface FabNavProps {
  /** Itens contextuais extras que variam por tela */
  contextItems?: FabItem[]
}

// ─── Itens globais sempre presentes ───────────────────────
const GLOBAL_ITEMS: FabItem[] = [
  { label: 'Hoje',      icon: <House size={15} weight="fill" />,          href: '/dashboard',          variant: 'primary'   },
  { label: 'Hábitos',   icon: <CheckSquare size={15} weight="fill" />,    href: '/dashboard/habits',   variant: 'primary'   },
  { label: 'Finanças',  icon: <CurrencyDollar size={15} weight="fill" />, href: '/dashboard/finance',  variant: 'primary'   },
  { label: 'Progresso', icon: <ProgressIcon size={15} />,                href: '/dashboard/progress', variant: 'primary'   },
  { label: 'Perfil',    icon: <User size={15} weight="fill" />,           href: '/dashboard/profile',  variant: 'primary'   },
]

// ─── Mapa de itens contextuais por rota ───────────────────
// Cada tela pode ter ações rápidas específicas
const CONTEXT_MAP: Record<string, FabItem[]> = {
  '/dashboard/habits': [
    { label: 'Novo hábito', icon: <Plus size={13} weight="bold" />, href: '/dashboard/habits?new=1', variant: 'secondary' },
  ],
  '/dashboard/finance': [
    { label: 'Nova entrada', icon: <Plus size={13} weight="bold" />, href: '/dashboard/finance?type=income',  variant: 'secondary' },
    { label: 'Nova saída',   icon: <Plus size={13} weight="bold" />, href: '/dashboard/finance?type=expense', variant: 'secondary' },
  ],
  '/dashboard/projects': [
    { label: 'Novo projeto', icon: <Plus size={13} weight="bold" />, href: '/dashboard/projects?new=1', variant: 'secondary' },
  ],
  '/dashboard/sprint': [
    { label: 'Nova tarefa', icon: <Plus size={13} weight="bold" />, href: '/dashboard/sprint?new=1', variant: 'secondary' },
  ],
}

// ─── Componente ───────────────────────────────────────────
export function FabNav({ contextItems }: FabNavProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [open, setOpen]         = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Detectar dispositivo
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Fechar ao clicar fora
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Fechar ao mudar de rota
  useEffect(() => { setOpen(false) }, [pathname])

  // Itens contextuais: prop explícita > mapa por rota
  const ctx = contextItems ?? CONTEXT_MAP[pathname] ?? []

  // Lista final: contextuais (topo/esquerda) + globais (baixo/direita)
  const items: FabItem[] = [...ctx, ...GLOBAL_ITEMS]

  // Se estiver na rota do item, não mostrar na lista
  const filtered = items.filter(item => item.href !== pathname)

  return (
    <div ref={containerRef} className="md:hidden fixed top-0 left-0 right-0 z-50">
      
      {/* Overlay escurecido ao abrir */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Barra fixa no topo */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-nb-bg border-b border-zinc-800">
        
        {/* Botão menu */}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            'p-2 flex items-center justify-center',
            'bg-amber-500 text-zinc-900',
            'border-2 border-zinc-900',
            'rounded-[8px]',
            'shadow-[2px_2px_0_#1c1917]',
            'transition-all duration-200',
            'active:translate-x-[1px] active:translate-y-[1px] active:shadow-none',
          )}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          <div className={cn('transition-transform duration-200', open && 'rotate-90')}>
            {open
              ? <X size={20} weight="bold" />
              : <List size={20} weight="bold" />
            }
          </div>
        </button>

        {/* Título do app */}
        <span className="text-amber-500 font-bold text-lg">Rootio</span>

        {/* Espaço vazio para balance */}
        <div className="w-10" />
      </div>

      {/* Itens do menu — aparecem abaixo da barra quando abertos */}
      <div
        className={cn(
          'absolute top-14 left-4 right-4 flex flex-col items-start gap-2 transition-all duration-300',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
      >
        {filtered.map((item, i) => (
          <FabItemButton
            key={i}
            item={item}
            index={i}
            open={open}
            onClick={() => {
              setOpen(false)
              if (item.action) item.action()
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Item individual ──────────────────────────────────────
function FabItemButton({
  item, index, open, onClick
}: {
  item:    FabItem
  index:   number
  open:    boolean
  onClick: () => void
}) {
  const isSecondary = item.variant === 'secondary'

  const content = (
    <div
      className={cn(
        'flex items-center gap-2.5 px-4 py-2.5',
        'border-2 border-zinc-900',
        'rounded-[8px]',
        'font-semibold text-sm',
        'transition-all duration-150',
        'active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
        isSecondary
          ? 'bg-amber-100 text-amber-800 shadow-[2px_2px_0_#92400e] border-amber-700 text-xs'
          : 'bg-amber-500 text-zinc-900 shadow-[3px_3px_0_#1c1917]',
        // Animação escalonada — itens sobem um a um
        open
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-3',
      )}
      style={{
        transitionDelay: open ? `${index * 40}ms` : '0ms',
      }}
    >
      {item.icon}
      <span>{item.label}</span>
    </div>
  )

  if (item.href) {
    return (
      <Link href={item.href} onClick={onClick} className="block">
        {content}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="block">
      {content}
    </button>
  )
}
