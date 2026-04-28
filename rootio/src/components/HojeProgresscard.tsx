'use client'
// src/components/HojeProgressCard.tsx
//
// Card "../hoje" com:
// - Grid de checkboxes em 2 linhas, todas visíveis (sem slice)
// - Cores por categoria: habito=creme, evento=violet, tarefa=sky, meta=amber
// - Contagem X/Y no final da 2ª linha
// - Progress bar grass com borda ink
// - Label "../hoje" em mono
// - Funciona em light (fundo branco) e dark (fundo #111)

import { Check } from '@phosphor-icons/react'
import { cn }    from '@/lib/utils'

// ─── Cores por categoria (baseado em listType) ─────────────────────────────────────
// done   = fill sólido da cor
// undone = borda da cor, fundo branco/transparente
const CATEGORY_COLORS: Record<string, string> = {
  habito:   '#F5EFDF', // hábito - creme
  evento:   '#9B7BFF', // evento - violet
  tarefa:   '#6FB8FF', // tarefa - sky
  meta:     '#F59E0B', // meta - amber
}
const DEFAULT_COLOR = '#F5EFDF'

interface HabitItem {
  id:       number | string
  done:     boolean
  listType?: string // 'habito' | 'evento' | 'tarefa' | 'meta'
  name?:    string
}

interface HojeProgressCardProps {
  habits:    HabitItem[]
  done:      number          // total concluídos
  total:     number          // total para hoje
  pct:       number          // 0–100
  onToggle?: (id: number | string) => void
  dark?:     boolean         // força modo escuro (default: auto por CSS)
  className?: string
}

// Tamanho de cada checkbox
const BOX = 24
const GAP = 6
// Máximo de colunas por linha
const COLS = 10

export function HojeProgressCard({
  habits, done, total, pct, onToggle, dark = false, className = '',
}: HojeProgressCardProps) {

  // Divide em linhas de COLS itens
  const rows: HabitItem[][] = []
  for (let i = 0; i < habits.length; i += COLS) {
    rows.push(habits.slice(i, i + COLS))
  }

  const cardBg     = dark ? '#1E1E1E' : '#ffffff'
  const cardBorder = dark ? '4px solid #111111' : '3px solid #111111'
  const cardShadow = dark ? '4px 4px 0 0 #111111' : '4px 4px 0 0 #111111'
  const labelColor = dark ? 'rgba(255,255,255,.45)' : 'rgba(0,0,0,.4)'
  const countColor = dark ? '#ffffff' : '#111111'

  return (
    <div
      className={className}
      style={{
        background:   cardBg,
        border:       'none',
        boxShadow:    'none',
        borderRadius: 4,
        padding:      '20px',
      }}
    >
      {/* Label "../hoje" */}
      <p
        style={{
          fontFamily:    'var(--font-space-grotesk)',
          fontSize:      11,
          fontWeight:    700,
          textTransform: 'none' as const,
          letterSpacing: '.12em',
          color:         labelColor,
          marginBottom:  12,
        }}
      >
        ../hoje
      </p>

      {/* Grid de checkboxes */}
      <div
        style={{
          display:       'flex',
          flexDirection: 'column' as const,
          gap:           GAP,
          marginBottom:  14,
        }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        GAP,
              flexWrap:   'nowrap' as const,
            }}
          >
            {row.map((h, colIdx) => {
              const categoryColor = CATEGORY_COLORS[h.listType ?? 'habito'] ?? DEFAULT_COLOR
              const isLast = rowIdx === rows.length - 1 && colIdx === row.length - 1
              
              // Cores por categoria quando feitos
              // hábito = creme, evento = violet, tarefa = sky, meta = amber
              const doneBg = h.done 
                ? categoryColor
                : (dark ? 'rgba(255,255,255,.08)' : '#fff')

              return (
                <div
                  key={h.id}
                  title={h.name}
                  style={{
                    width:          BOX,
                    height:         BOX,
                    flexShrink:     0,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    border:         '2.5px solid #111111',
                    background:     doneBg,
                    borderRadius:   4,
                    boxShadow:      '2px 2px 0 0 #111111',
                    cursor:         'default',
                    padding:        0,
                  }}
                >
                  {h.done && (
                    <Check
                      size={14}
                      weight="bold"
                      style={{ color: '#111111', display: 'block' }}
                    />
                  )}
                </div>
              )
            })}

            {/* Contagem X/Y — aparece no final da última linha */}
            {rowIdx === rows.length - 1 && (
              <span
                style={{
                  fontFamily:    'var(--font-space-grotesk)',
                  fontSize:      13,
                  fontWeight:    700,
                  color:         countColor,
                  marginLeft:    4,
                  whiteSpace:    'nowrap' as const,
                  flexShrink:    0,
                }}
              >
                {done}/{total}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar — grass com borda ink */}
      <div
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        10,
        }}
      >
        <div
          style={{
            flex:         1,
            height:       14,
            background:   dark ? 'rgba(255,255,255,.1)' : '#fff',
            border:       '2.5px solid #111111',
            boxShadow:    '2px 2px 0 0 #111111',
            position:     'relative' as const,
            overflow:     'hidden',
            borderRadius: 4,
          }}
        >
          <div
            style={{
              position:          'absolute' as const,
              inset:             '0 auto 0 0',
              width:             `${pct}%`,
              background:        '#7CE577',  // grass
              borderRight:       pct < 100 ? '2px solid #111111' : 'none',
              transition:        'width .4s ease',
            }}
          />
        </div>

        <span
          style={{
            fontFamily:    'var(--font-space-grotesk)',
            fontSize:      13,
            fontWeight:    700,
            color:         countColor,
            flexShrink:    0,
            minWidth:      36,
          }}
        >
          {pct}%
        </span>
      </div>
    </div>
  )
}