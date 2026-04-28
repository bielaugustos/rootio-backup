'use client'
// src/components/NbEmptyState.tsx
//
// Estado vazio unificado para todas as telas — neobrutalism puro
//
// Uso básico:
//   <NbEmptyState
//     icon="📋"
//     title="Nenhum projeto ainda"
//     sub="Crie seu primeiro projeto e comece a organizar sua vida."
//     action={{ label: 'Criar projeto', onClick: openForm }}
//   />
//
// Uso com link:
//   <NbEmptyState
//     icon="💰"
//     title="Sem transações"
//     sub="Registre entradas e saídas para acompanhar seu saldo."
//     action={{ label: 'Registrar transação', href: '/dashboard/finance' }}
//   />
//
// Variante silenciosa (recomeço / contexto discreto):
//   <NbEmptyState
//     title="Nada aqui ainda."
//     action={{ label: 'Adicionar', onClick: openForm }}
//     quiet
//   />

import Link   from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'

interface EmptyAction {
  label:   string
  onClick?: () => void
  href?:   string
}

interface NbEmptyStateProps {
  icon?:    string                    // emoji — ex: "📋", "💰", "🌱"
  title:    string                    // ex: "Nenhum hábito ainda"
  sub?:     string                    // frase de suporte / direcionamento
  action?:  EmptyAction               // botão ou link de CTA
  quiet?:   boolean                   // modo silencioso — sem borda sólida, sem fill
  dark?:    boolean                   // força fundo escuro
  className?: string
}

export function NbEmptyState({
  icon, title, sub, action, quiet = false, dark = false, className = '',
}: NbEmptyStateProps) {

  // ── Modo silencioso — recomeço, contextos discretos ──────────────────
  if (quiet) return (
    <div
      className={className}
      style={{
        padding:    '28px 20px',
        textAlign:  'center' as const,
        border:     '2px dashed rgba(0,0,0,.15)',
        borderRadius: 0,
        background: 'transparent',
      }}
    >
      {icon && (
        <span style={{ fontSize: 28, display: 'block', marginBottom: 10, opacity: .4 }}>
          {icon}
        </span>
      )}
      <p style={{
        fontFamily:    'var(--font-mono, monospace)',
        fontSize:      12,
        fontWeight:    700,
        textTransform: 'uppercase' as const,
        letterSpacing: '.14em',
        color:         'rgba(0,0,0,.3)',
        marginBottom:  action ? 16 : 0,
      }}>
        {title}
      </p>
      {action && <EmptyActionBtn action={action} quiet />}
    </div>
  )

  // ── Modo padrão ───────────────────────────────────────────────────────
  const bg    = dark ? '#111111' : '#ffffff'
  const bdr   = '3px solid #111111'
  const sh    = '4px 4px 0 0 #111111'
  const cMain = dark ? '#ffffff' : '#111111'
  const cSub  = dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)'
  const cLbl  = dark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.3)'

  return (
    <div
      className={className}
      style={{
        background:   bg,
        border:       bdr,
        boxShadow:    sh,
        borderRadius: 0,
        padding:      '32px 24px',
        textAlign:    'center' as const,
        position:     'relative' as const,
        overflow:     'hidden',
      }}
    >
      {/* Hachura de fundo — textura visual sutil */}
      <div aria-hidden style={{
        position:   'absolute' as const,
        inset:      0,
        backgroundImage:
          'repeating-linear-gradient(-45deg, rgba(0,0,0,.025) 0 1px, transparent 1px 8px)',
        pointerEvents: 'none',
        zIndex:     0,
      }} />

      <div style={{ position: 'relative' as const, zIndex: 1 }}>

        {/* Ícone */}
        {icon && (
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          52,
            height:         52,
            background:     dark ? 'rgba(255,255,255,.07)' : '#F5EFDF',
            border:         `2px solid ${dark ? 'rgba(255,255,255,.12)' : '#111111'}`,
            fontSize:       26,
            marginBottom:   16,
          }}>
            {icon}
          </div>
        )}

        {/* Label kicker */}
        <p style={{
          fontFamily:    'var(--font-mono, monospace)',
          fontSize:      10,
          fontWeight:    700,
          textTransform: 'uppercase' as const,
          letterSpacing: '.16em',
          color:         cLbl,
          marginBottom:  8,
        }}>
          vazio
        </p>

        {/* Título */}
        <p style={{
          fontFamily:    'var(--font-display, sans-serif)',
          fontWeight:    900,
          fontSize:      22,
          textTransform: 'uppercase' as const,
          letterSpacing: '-.01em',
          lineHeight:    1,
          color:         cMain,
          marginBottom:  sub ? 10 : action ? 20 : 0,
        }}>
          {title}
        </p>

        {/* Subtítulo */}
        {sub && (
          <p style={{
            fontFamily: 'var(--font-body, system-ui)',
            fontSize:   13,
            lineHeight: 1.55,
            color:      cSub,
            maxWidth:   '30ch',
            margin:     '0 auto',
            marginBottom: action ? 24 : 0,
          }}>
            {sub}
          </p>
        )}

        {/* Ação */}
        {action && <EmptyActionBtn action={action} dark={dark} />}

      </div>
    </div>
  )
}

// ─── Botão / Link de ação ─────────────────────────────────────────────────────
function EmptyActionBtn({
  action, dark = false, quiet = false,
}: {
  action: EmptyAction; dark?: boolean; quiet?: boolean
}) {
  const style: React.CSSProperties = quiet ? {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            6,
    padding:        '8px 14px',
    background:     'transparent',
    color:          'rgba(0,0,0,.45)',
    border:         '2px solid rgba(0,0,0,.2)',
    borderRadius:   0,
    fontFamily:     'var(--font-body, system-ui)',
    fontWeight:     700,
    fontSize:       12,
    textTransform:  'uppercase' as const,
    letterSpacing:  '.06em',
    cursor:         'pointer',
    textDecoration: 'none',
  } : {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    width:          '100%',
    padding:        '13px 18px',
    background:     '#F59E0B',
    color:          '#ffffff',
    border:         '3px solid #111111',
    boxShadow:      '3px 3px 0 0 #111111',
    borderRadius:   0,
    fontFamily:     'var(--font-display, sans-serif)',
    fontWeight:     900,
    fontSize:       14,
    textTransform:  'uppercase' as const,
    letterSpacing:  '.04em',
    cursor:         'pointer',
    textDecoration: 'none',
  }

  if (action.href) {
    return (
      <Link href={action.href} style={style}>
        <span>{action.label}</span>
        <ArrowRight size={quiet ? 12 : 16} weight="bold" />
      </Link>
    )
  }

  return (
    <button onClick={action.onClick} style={{ ...style, border: style.border as string }}>
      <span>{action.label}</span>
      <ArrowRight size={quiet ? 12 : 16} weight="bold" />
    </button>
  )
}