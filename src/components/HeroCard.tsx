'use client'
// src/components/HeroCard.tsx
// Card escuro "o que fazer agora?" — design conforme storyboard
// Uso: <HeroCard habit={next} onConcluir={() => toggleHabit(next.id)} onPular={...} />

import Link from 'next/link'
import { ArrowRight, SkipForward, Clock, Triangle, ArrowCounterClockwise, Target } from '@phosphor-icons/react'
import { useAppStore } from '@/store/useAppStore'
import { getNivel, getProgresso } from '@/lib/io-system'

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface HeroCardHabit {
  id:       number | string
  name:     string
  priority: 'alta' | 'media' | 'baixa'
  freq?:    string
  category?: string
}

interface HeroCardProps {
  habit:       HeroCardHabit
  onConcluir:  () => void
  onPular?:    () => void
  className?:  string
}

// ─── Tags de prioridade ───────────────────────────────────────────────────────
const PRI_LABEL: Record<string, string> = {
  alta:  'Alta Prioridade',
  media: 'Média Prioridade',
  baixa: 'Baixa Prioridade',
}

// bg sólido + borda ink — sem opacity, funciona sobre fundo escuro
const PRI_STYLE: Record<string, React.CSSProperties> = {
  alta:  { background: '#FF6B6B', color: '#fff',     border: '2px solid #111', borderRadius: 0 },
  media: { background: '#F59E0B', color: '#fff',     border: '2px solid #111', borderRadius: 0 },
  baixa: { background: '#7CE577', color: '#111',     border: '2px solid #111', borderRadius: 0 },
}

// Cores por tipo/contexto para a badge secundária
const TYPE_STYLE: Record<string, React.CSSProperties> = {
  default:  { background: '#FDFBF5', color: '#111111', border: '2px solid #111', borderRadius: 0 },
  habito:   { background: '#F5EFDF', color: '#111111', border: '2px solid #111', borderRadius: 0 },
  evento:   { background: '#9B7BFF', color: '#ffffff', border: '2px solid #111', borderRadius: 0 },
  tarefa:   { background: '#6FB8FF', color: '#111111', border: '2px solid #111', borderRadius: 0 },
  meta:     { background: '#F59E0B', color: '#ffffff', border: '2px solid #111', borderRadius: 0 },
}

// ─── Frequência → label legível ───────────────────────────────────────────────
function freqLabel(freq?: string): string {
  if (!freq) return 'Hábito'
  const map: Record<string, string> = {
    diario:   'Hábito',
    semanal:  'Semanal',
    mensal:   'Mensal',
    evento:   'Evento',
    tarefa:   'Tarefa',
    meta:     'Meta',
  }
  return map[freq] ?? freq.charAt(0).toUpperCase() + freq.slice(1)
}

// ─── Mapeamento tipo → chave de cor ───────────────────────────────────────────
function typeKey(habit: HeroCardHabit): string {
  if (habit.category) return habit.category
  if (habit.freq) {
    switch (habit.freq) {
      case 'diario':   return 'habito'
      case 'evento':   return 'evento'
      case 'tarefa':   return 'tarefa'
      case 'meta':     return 'meta'
      default:         return 'default'
    }
  }
  return 'default'
}

// ─── Kicker label por tipo ─────────────────────────────────────────────────────
function kickerLabel(habit: HeroCardHabit): { text: string; Icon: any } {
  const key = typeKey(habit)
  if (key === 'evento') {
    return { text: 'lembrete!', Icon: Triangle }
  }
  if (key === 'tarefa') {
    return { text: 'algo frequente.', Icon: ArrowCounterClockwise }
  }
  if (key === 'meta') {
    return { text: 'próxima ação.', Icon: Target }
  }
  return { text: 'o que fazer agora?', Icon: Clock }
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function HeroCard({ habit, onConcluir, onPular, className = '' }: HeroCardProps) {
  const typeColor = TYPE_STYLE[typeKey(habit)]
  const kicker = kickerLabel(habit)

  return (
    <div
      className={className}
      style={{
        position:     'relative',
        background:   '#1E1E1E',
        border:       '4px solid #111111',
        boxShadow:    '4px 4px 0 0 #111111',
        overflow:     'hidden',
        borderRadius: 0,
        padding:      '20px 20px 20px 20px',
      }}
    >
      {/* ── Decoração geométrica — canto superior direito ── */}
      {/* Polígono paper saindo pelo canto — cor dinâmica por tipo */}
      <div
        aria-hidden
        style={{
          position:   'absolute',
          top:        -60,
          right:      -50,
          width:      180,
          height:     220,
          background: typeColor.background,
          transform:  'rotate(18deg)',
          zIndex:     0,
        }}
      />

      {/* ── Conteúdo (z-index acima da decoração) ── */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Kicker */}
        <div
          style={{
            display:       'flex',
            alignItems:    'center',
            gap:           6,
            marginBottom:  14,
            fontFamily:    'var(--font-space-grotesk)',
            fontSize:      11,
            fontWeight:    500,
            textTransform: 'none',
            letterSpacing: '.14em',
            color:         'rgba(255,255,255,.5)',
          }}
        >
          <kicker.Icon size={16} weight="regular" style={{ flexShrink: 0 }} />
          {kicker.text}
        </div>

        {/* Título — nome do hábito */}
        <h2
          style={{
            fontFamily:    'var(--font-display, sans-serif)',
            fontWeight:    900,
            fontSize:      32,
            lineHeight:    .95,
            color:         '#ffffff',
            letterSpacing: '-.01em',
            marginBottom:  16,
            maxWidth:      '70%',   // não sobrepõe a decoração
          }}
        >
          {habit.name}
        </h2>

        {/* Tags — prioridade + tipo */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const }}>
          {/* Tag de prioridade */}
          <span
            style={{
              ...PRI_STYLE[habit.priority],
              display:       'inline-flex',
              alignItems:    'center',
              padding:       '4px 10px',
              fontFamily:    'var(--font-mono, monospace)',
              fontSize:      10,
              fontWeight:    700,
              textTransform: 'uppercase' as const,
              letterSpacing: '.1em',
            }}
          >
            {PRI_LABEL[habit.priority]}
          </span>

           {/* Tag de tipo/freq */}
           <span
             style={{
               ...TYPE_STYLE[typeKey(habit)],
               display:       'inline-flex',
               alignItems:    'center',
               padding:       '4px 10px',
               fontFamily:    'var(--font-mono, monospace)',
               fontSize:      10,
               fontWeight:    700,
               textTransform: 'uppercase' as const,
               letterSpacing: '.1em',
             }}
           >
             {habit.category ?? freqLabel(habit.freq)}
           </span>
        </div>

         {/* Botões de ação */}
         <div style={{ display: 'flex', gap: 16 }}>

            {/* Botão principal — Concluir agora */}
            <button
              onClick={onConcluir}
              style={{
                flex:          0.8,
                display:       'flex',
                alignItems:    'center',
                justifyContent:'space-between',
                padding:       '14px 18px',
                height:        40,
                background:    typeColor.background,
                color:         typeColor.color,
                border:        '3px solid #111111',
                borderRadius:  4,
                boxShadow:     '3px 3px 0 0 #111111',
                fontFamily:    'var(--font-display, sans-serif)',
                fontWeight:    900,
                fontSize:      14,
                textTransform: 'uppercase' as const,
                letterSpacing: '.06em',
                cursor:        'pointer',
                transition:    'transform .08s, box-shadow .08s',
              }}
             onMouseEnter={e => {
               const t = e.currentTarget
               t.style.transform = 'translate(-1px,-1px)'
               t.style.boxShadow = '4px 4px 0 0 #111111'
             }}
             onMouseLeave={e => {
               const t = e.currentTarget
               t.style.transform = ''
               t.style.boxShadow = '3px 3px 0 0 #111111'
             }}
             onMouseDown={e => {
               const t = e.currentTarget
               t.style.transform = 'translate(2px,2px)'
               t.style.boxShadow = '1px 1px 0 0 #111111'
             }}
             onMouseUp={e => {
               const t = e.currentTarget
               t.style.transform = 'translate(-1px,-1px)'
               t.style.boxShadow = '4px 4px 0 0 #111111'
             }}
           >
             <span>Concluir agora</span>
             <ArrowRight size={16} weight="bold" />
           </button>

            {/* Botão secundário — Pular (>|) */}
            {onPular && (
              <button
                onClick={onPular}
                title="Pular para o próximo"
                style={{
                  width:         40,
                  height:        40,
                  display:       'flex',
                  alignItems:    'center',
                  justifyContent:'center',
                  background:    typeColor.background,
                  color:         typeColor.color,
                  border:        '3px solid #111111',
                  borderRadius:  0,
                  boxShadow:     '3px 3px 0 0 #111111',
                  cursor:        'pointer',
                  flexShrink:    0,
                  transition:    'transform .08s, box-shadow .08s',
                }}
               onMouseEnter={e => {
                 const t = e.currentTarget
                 t.style.transform = 'translate(-1px,-1px)'
                 t.style.boxShadow = '4px 4px 0 0 #111111'
               }}
               onMouseLeave={e => {
                 const t = e.currentTarget
                 t.style.transform = ''
                 t.style.boxShadow = '3px 3px 0 0 #111111'
               }}
               onMouseDown={e => {
                 const t = e.currentTarget
                 t.style.transform = 'translate(2px,2px)'
                 t.style.boxShadow = '1px 1px 0 0 #111111'
               }}
               onMouseUp={e => {
                 const t = e.currentTarget
                 t.style.transform = 'translate(-1px,-1px)'
                 t.style.boxShadow = '4px 4px 0 0 #111111'
               }}
             >
               <SkipForward size={16} weight="bold" />
             </button>
           )}
        </div>

      </div>
    </div>
  )
}

// ─── Variante vazia — nenhum hábito pendente ─────────────────────────────────
export function HeroCardEmpty() {
  // Dados do store — enriquecem o card com info real
  const { economy, habits, history } = useAppStore()
  const nivel       = getNivel(economy.xp_total)
  const pctNivel    = getProgresso(economy.xp_total)
  const faltamXP    = nivel.xp_max === Infinity ? null : nivel.xp_max - economy.xp_total

  const today       = new Date().getDay()
  const totalHoje   = habits.filter(h => h.days?.includes(today) ?? true).length
  const ioGanhoHoje = economy.io_hoje

  // Dias seguidos com 100% — contar do histórico
  const now          = new Date()
  let   diasPerfeitos = 0
  for (let i = 1; i <= 30; i++) {
    const d   = new Date(now)
    d.setDate(now.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const h   = history[key]
    if (h && h.total > 0 && h.done === h.total) diasPerfeitos++
    else break
  }

  return (
    <div
      style={{
        background:   '#1E1E1E',
        border:       '4px solid #111111',
        boxShadow:    '4px 4px 0 0 #111111',
        padding:      '20px',
        borderRadius: 0,
        overflow:     'hidden',
        position:     'relative' as const,
      }}
    >
      {/* Decoração geométrica — espelhada do HeroCard */}
      <div aria-hidden style={{
        position: 'absolute', bottom: -40, right: -40,
        width: 160, height: 160,
        background: '#FFD23F', opacity: .08,
        transform: 'rotate(25deg)',
        pointerEvents: 'none',
      }} />

      {/* Bloco principal */}
      <div style={{ padding: '24px 20px 0', textAlign: 'center' as const, position: 'relative', zIndex: 1 }}>

        {/* Kicker */}
        <p style={{
          fontFamily: 'var(--font-space-grotesk)', fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase' as const, letterSpacing: '.18em',
          color: 'rgba(255,255,255,.35)', marginBottom: 12,
        }}>
          ✓ tudo concluído <br></br>
        </p>


        {/* Mensagem motivacional — rotaciona baseado no streak */}
        <p style={{
          fontFamily: 'var(--font-body, system-ui)', fontSize: 13,
          color: 'rgba(255,255,255,.5)', marginBottom: 20, lineHeight: 1.5,
        }}>
          {economy.streak >= 7
            ? `${economy.streak} dias seguidos. Você tá construindo algo real.`
            : economy.streak >= 3
            ? `${economy.streak} dias de consistência. Segue.`
            : diasPerfeitos > 0
            ? `${diasPerfeitos} dia${diasPerfeitos > 1 ? 's' : ''} perfeito${diasPerfeitos > 1 ? 's' : ''} seguidos.`
            : 'Primeiro dia perfeito do streak. Não para amanhã.'}
        </p>

      </div>

        {/* Botão */}
        <div style={{ padding: '0 20px 20px' }}>
          <Link
            href="/dashboard/habits"
            style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '13px 16px', background: '#F59E0B', color: '#000', height: 50,
              border: '3px solid #111111', boxShadow: '3px 3px 0 0 #111111',
              borderRadius: 0, fontFamily: 'var(--font-display, sans-serif)',
              fontWeight: 900, fontSize: 13, textTransform: 'uppercase' as const,
              letterSpacing: '.04em', textDecoration: 'none',
              transition: 'transform .08s, box-shadow .08s',
            }}
           onMouseEnter={e => {
             const t = e.currentTarget
             t.style.transform = 'translate(-1px,-1px)'
             t.style.boxShadow = '4px 4px 0 0 #111111'
           }}
           onMouseLeave={e => {
             const t = e.currentTarget
             t.style.transform = ''
             t.style.boxShadow = '3px 3px 0 0 #111111'
           }}
           onMouseDown={e => {
             const t = e.currentTarget
             t.style.transform = 'translate(2px,2px)'
             t.style.boxShadow = '1px 1px 0 0 #111111'
           }}
           onMouseUp={e => {
             const t = e.currentTarget
             t.style.transform = 'translate(-1px,-1px)'
             t.style.boxShadow = '4px 4px 0 0 #111111'
           }}
         >
           <span>VER HÁBITOS</span>
           <ArrowRight size={14} weight="bold" style={{ position: 'absolute', right: 14 }} />
         </Link>
       </div>
    </div>
  )
}

// ─── Variante sem hábitos — onboarding ───────────────────────────────────────
export function HeroCardEmpty_NoHabits() {
  return (
    <div
      style={{
        background:   '#1E1E1E',
        border:       '3px solid #1E1E1E',
        boxShadow:    '5px 5px 0 0 #1E1E1E',
        padding:      '20px',
        borderRadius: 0,
        textAlign:    'center' as const,
      }}
    >
      <p
        style={{
          fontFamily:    'var(--font-space-grotesk)',
          fontSize:      10,
          color:         'rgba(255,255,255,.35)',
          textTransform: 'uppercase' as const,
          letterSpacing: '.14em',
          marginBottom:  10,
        }}
      >
        nenhum hábito ainda
      </p>
      <p
        style={{
          fontFamily:    'var(--font-display, sans-serif)',
          fontWeight:    900,
          fontSize:      20,
          color:         '#fff',
          textTransform: 'uppercase' as const,
          marginBottom:  16,
        }}
      >
        Por onde começar?
      </p>
      <Link
        href="/dashboard/habits"
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '13px 16px', background: '#F59E0B', color: '#000',
          border: '3px solid #111111', boxShadow: '3px 3px 0 0 #000',
          borderRadius: 4, fontFamily: 'var(--font-display, sans-serif)',
          fontWeight: 900, fontSize: 13, textTransform: 'uppercase' as const,
          letterSpacing: '.04em', textDecoration: 'none',
          transition: 'transform .08s, box-shadow .08s',
        }}
        onMouseEnter={e => {
          const t = e.currentTarget
          t.style.transform = 'translate(-1px,-1px)'
          t.style.boxShadow = '4px 4px 0 0 #111111'
        }}
        onMouseLeave={e => {
          const t = e.currentTarget
          t.style.transform = ''
          t.style.boxShadow = '3px 3px 0 0 #111111'
        }}
        onMouseDown={e => {
          const t = e.currentTarget
          t.style.transform = 'translate(2px,2px)'
          t.style.boxShadow = '1px 1px 0 0 #111111'
        }}
        onMouseUp={e => {
          const t = e.currentTarget
          t.style.transform = 'translate(-1px,-1px)'
          t.style.boxShadow = '4px 4px 0 0 #111111'
        }}
      >
        <span>Criar meu primeiro hábito</span>
        <ArrowRight size={14} weight="bold" style={{ position: 'absolute', right: 14 }} />
      </Link>
    </div>
  )
}