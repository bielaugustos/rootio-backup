'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  House, CheckSquare, CurrencyDollar, Trophy,
  User, MagnifyingGlass, ArrowLeft, List, X,
  Plus, Lightning,
} from '@phosphor-icons/react'

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
  { label: 'Progresso', icon: <Trophy size={15} weight="fill" />,         href: '/dashboard/progress', variant: 'primary'   },
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
    // Só aparece no mobile — no desktop a sidebar cuida da navegação
    <div ref={containerRef} className="md:hidden">

      {/* Overlay escurecido ao abrir */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Container do FAB — fixo no canto inferior direito */}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-2.5">

        {/* Itens expandidos — sobem verticalmente */}
        <div
          className={cn(
            'flex flex-col items-end gap-2 transition-all duration-300',
            open
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-4 pointer-events-none'
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

        {/* Botão FAB principal */}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            'w-14 h-14 flex items-center justify-center',
            'bg-amber-500 text-zinc-900',
            'border-2 border-zinc-900',
            'rounded-[10px]',                           // quadrado — neobrutalism
            'shadow-[4px_4px_0_#1c1917]',
            'transition-all duration-200',
            'active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
            open && 'rotate-[5deg]'
          )}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          <div className={cn('transition-transform duration-200', open && 'rotate-45')}>
            {open
              ? <X size={22} weight="bold" />
              : <List size={22} weight="bold" />
            }
          </div>
        </button>

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
