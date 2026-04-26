'use client'

// Card "../carreira" — exibe aprendizado ativo ou estado vazio
// Light: fundo branco, borda ink, sombra ink
// Dark:  fundo #111, borda ink, sombra ink
//
// Uso com aprendizado:
//   <CarreiraCard learn={learn} onAvancar={() => advanceLearnStatus(learn.id)} />
//
// Uso vazio:
//   <CarreiraCard onCriar="/dashboard/career?tab=aprendizado" />

import Link from 'next/link'
import { ArrowRight, ReadCvLogo } from '@phosphor-icons/react'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Learn {
  id:     number | string
  title:  string
  type?:  string      // 'Curso' | 'Livro' | 'Artigo'
  area?:  string
  status: string      // 'quero' | 'em andamento' | 'concluído'
}

interface CarreiraCardProps {
  learn?:   Learn                      // se undefined → estado vazio
  onAvancar?: () => void               // avançar status do aprendizado
  onCriar?:  string                    // href para criar aprendizado
  dark?:     boolean                   // força modo escuro
  className?: string
}

// ─── Status → label e cor do badge ───────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  'quero':        { label: 'Quero',        bg: '#FEF3C7', color: '#92400e' },
  'em andamento': { label: 'Em andamento', bg: '#DBEAFE', color: '#1e40af' },
  'concluído':    { label: 'Concluído',    bg: '#D1FAE5', color: '#065f46' },
}

// ─── Ícone de tipo de aprendizado ────────────────────────────────────────────
function TypeIcon({ type }: { type?: string }) {
  return <ReadCvLogo size={16} weight="regular" style={{ flexShrink: 0 }} />
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function CarreiraCard({
  learn, onAvancar, onCriar = '/dashboard/career?tab=aprendizado',
  dark = false, className = '',
}: CarreiraCardProps) {

   const bg          = dark ? '#1E1E1E' : '#ffffff'
   const labelColor  = dark ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.4)'
   const textColor   = dark ? '#ffffff' : '#111111'
   const muteColor   = dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.45)'
   const iconColor   = dark ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.35)'

   return (
      <div
        className={className}
        style={{
          background:   bg,
          border:       'none',
          boxShadow:    'none',
          borderRadius: 0,
          padding:      '20px',
        }}
      >
       {/* Label "../carreira" */}
       <p
         style={{
           fontFamily:    'var(--font-space-grotesk)', fontSize: 11, fontWeight: 700,
           textTransform: 'none' as const, letterSpacing: '.12em', color: labelColor,
           marginBottom:  20,
         }}
       >
        ../carreira
      </p>

      {/* ── Estado vazio ── */}
      {!learn && (
        <>
          <div
            style={{
              display:       'flex',
              alignItems:    'center',
              gap:           10,
              marginBottom:  18,
            }}
          >
            <ReadCvLogo size={18} style={{ color: iconColor, flexShrink: 0 }} />
            <span
              style={{
                fontFamily: 'var(--font-body, system-ui)',
                fontSize:   14,
                color:      muteColor,
              }}
            >
              Nenhum aprendizado para mostrar
            </span>
          </div>

          {/* Botão "Criar agora" */}
          <Link
            href={onCriar}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '13px 16px',
              height:         40,
              background:     '#F59E0B',
              color:          '#000',
              border:         '2px solid #111111',
              boxShadow:      '2px 2px 0 0 #111111',
              borderRadius:   4,
              fontFamily:     'var(--font-display, sans-serif)',
              fontWeight:     900,
              fontSize:       13,
              textTransform:  'uppercase' as const,
              letterSpacing:  '.04em',
              textDecoration: 'none',
              transition:     'all .075s ease',
            }}
            onMouseEnter={e => {
              const t = e.currentTarget
              t.style.boxShadow = 'none'
              t.style.transform = 'translate(4px,4px)'
            }}
            onMouseLeave={e => {
              const t = e.currentTarget
              t.style.boxShadow = '2px 2px 0 0 #111111'
              t.style.transform = ''
            }}
            onMouseDown={e => {
              const t = e.currentTarget
              t.style.boxShadow = 'none'
              t.style.transform = 'translate(4px,4px)'
            }}
            onMouseUp={e => {
              const t = e.currentTarget
              t.style.boxShadow = 'none'
              t.style.transform = 'translate(4px,4px)'
            }}
          >
            <span>Criar agora</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </>
      )}

      {/* ── Estado com aprendizado ── */}
      {learn && (
        <>
          {/* Ícone + título */}
          <div
            style={{
              display:       'flex',
              alignItems:    'flex-start',
              gap:           10,
              marginBottom:  10,
            }}
          >
            <TypeIcon type={learn.type} />
            <p
              style={{
                fontFamily:  'var(--font-body, system-ui)',
                fontSize:    15,
                fontWeight:  700,
                color:       textColor,
                lineHeight:  1.3,
                margin:      0,
              }}
            >
              {learn.title}
            </p>
          </div>

          {/* Badges — área, tipo, status */}
          <div
            style={{
              display:      'flex',
              gap:          6,
              flexWrap:     'wrap' as const,
              marginBottom: 16,
            }}
          >
            {learn.area && (
              <span style={badgeStyle(dark)}>{learn.area}</span>
            )}
            {learn.type && (
              <span style={badgeStyle(dark)}>{learn.type}</span>
            )}
            {(() => {
              const s = STATUS_MAP[learn.status] ?? STATUS_MAP['quero']
              return (
                <span
                  style={{
                    display:       'inline-flex',
                    alignItems:    'center',
                    padding:       '3px 8px',
                    background:    s.bg,
                    color:         s.color,
                    border:        '2px solid #111111',
                    borderRadius:  0,
                    fontFamily:    'var(--font-mono, monospace)',
                    fontSize:      10,
                    fontWeight:    700,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '.1em',
                  }}
                >
                  {s.label}
                </span>
              )
            })()}
          </div>

           {/* Botão de ação */}
           {learn.status !== 'concluído' ? (
             <button
               onClick={onAvancar}
               style={{
                 display:        'flex',
                 alignItems:     'center',
                 justifyContent: 'space-between',
                 width:          '100%',
                 padding:        '13px 16px',
                 height:         40,
                 background:     '#F59E0B',
                 color:          '#000',
                 border:         '2px solid #111111',
                 borderRadius:   4,
                 boxShadow:      '2px 2px 0 0 #111111',
                 fontFamily:     'var(--font-display, sans-serif)',
                 fontWeight:     900,
                 fontSize:       13,
                 textTransform:  'uppercase' as const,
                 letterSpacing:  '.04em',
                 cursor:         'pointer',
                 transition:     'all .075s ease',
               }}
              onMouseEnter={e => {
                const t = e.currentTarget
                t.style.boxShadow = 'none'
                t.style.transform = 'translate(4px,4px)'
              }}
              onMouseLeave={e => {
                const t = e.currentTarget
                t.style.boxShadow = '2px 2px 0 0 #111111'
                t.style.transform = ''
              }}
              onMouseDown={e => {
                const t = e.currentTarget
                t.style.boxShadow = 'none'
                t.style.transform = 'translate(4px,4px)'
              }}
              onMouseUp={e => {
                const t = e.currentTarget
                t.style.boxShadow = 'none'
                t.style.transform = 'translate(4px,4px)'
              }}
            >
              <span>Avançar status</span>
              <ArrowRight size={14} weight="bold" />
            </button>
           ) : (
             <Link
               href={onCriar}
               style={{
                 display:        'flex',
                 alignItems:     'center',
                 justifyContent: 'space-between',
                 padding:        '13px 16px',
                 height:         40,
                 background:     '#F59E0B',
                 color:          '#000',
                 border:         '2px solid #111111',
                 boxShadow:      '2px 2px 0 0 #111111',
                 borderRadius:   4,
                 fontFamily:     'var(--font-display, sans-serif)',
                 fontWeight:     900,
                 fontSize:       13,
                 textTransform:  'uppercase' as const,
                 letterSpacing:  '.04em',
                 textDecoration: 'none',
                 transition:     'all .075s ease',
               }}
               onMouseEnter={e => {
                 const t = e.currentTarget
                 t.style.boxShadow = 'none'
                 t.style.transform = 'translate(4px,4px)'
               }}
               onMouseLeave={e => {
                 const t = e.currentTarget
                 t.style.boxShadow = '2px 2px 0 0 #111111'
                 t.style.transform = ''
               }}
               onMouseDown={e => {
                 const t = e.currentTarget
                 t.style.boxShadow = 'none'
                 t.style.transform = 'translate(4px,4px)'
               }}
               onMouseUp={e => {
                 const t = e.currentTarget
                 t.style.boxShadow = 'none'
                 t.style.transform = 'translate(4px,4px)'
               }}
             >
              <span>Criar novo aprendizado</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          )}
        </>
      )}
    </div>
  )
}

// ─── Helper badge neutro ──────────────────────────────────────────────────────
export function badgeStyle(dark: boolean): React.CSSProperties {
  return {
    display:       'inline-flex',
    alignItems:    'center',
    padding:       '3px 8px',
    background:    dark ? 'rgba(255,255,255,.1)' : '#F5EFDF',
    color:         dark ? 'rgba(255,255,255,.7)' : '#111111',
    border:        '2px solid #111111',
    borderRadius:  0,
    fontFamily:    'var(--font-mono, monospace)',
    fontSize:      10,
    fontWeight:    700,
    textTransform: 'uppercase' as const,
    letterSpacing: '.1em',
  }
}
