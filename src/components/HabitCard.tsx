'use client'
// src/components/HabitCard.tsx
// Card de hábito seguindo exatamente o design system do theme-editor
// Usa CSS vars: --c-habit, --c-goal, --c-task, --c-event, --c-habit-b, etc.

import React, { useState } from 'react'
import { Habit } from '@/store/useAppStore'
import {
  Check, PencilSimple, Trash, CaretDown, CaretUp,
  Lightning, ArrowClockwise, CalendarBlank, ChartBar,
  WarningCircle, Kanban, DotsThree,
} from '@phosphor-icons/react'

// ─── Mapa de cores por tipo — espelho do theme-editor ────────────────────────
function useTypeColors(type: string, isDark: boolean) {
  const map: Record<string, {
    border: string; bg: string; badge: string; badgeText: string; bg2: string
  }> = {
    habito: {
      border:    'var(--c-habit-b, #D4C9A9)',
      bg:        'var(--c-habit, #F5EFDF)',
      badge:     'var(--c-habit, #F5EFDF)',
      badgeText: isDark ? '#fff' : 'var(--c-habit-t, #0C0C0C)',
      bg2:       'var(--c-habit-bg, #F5EFDF)',
    },
    meta: {
      border:    'var(--c-goal-b, #92400E)',
      bg:        'var(--c-goal, #F59E0B)',
      badge:     'var(--c-goal, #F59E0B)',
      badgeText: isDark ? '#fff' : 'var(--c-goal-t, #92400E)',
      bg2:       'var(--c-goal-bg, #1f1500)',
    },
    tarefa: {
      border:    'var(--c-task-b, #1D4ED8)',
      bg:        'var(--c-task, #6FB8FF)',
      badge:     'var(--c-task, #6FB8FF)',
      badgeText: isDark ? '#fff' : '#000',
      bg2:       'var(--c-task-bg, #0a1825)',
    },
    evento: {
      border:    'var(--c-event-b, #5B21B6)',
      bg:        'var(--c-event, #9B7BFF)',
      badge:     'var(--c-event, #9B7BFF)',
      badgeText: isDark ? '#fff' : '#fff',
      bg2:       'var(--c-event-bg, #130e24)',
    },
  }
  return map[type] ?? map.habito
}

// ─── Pills de ação por tipo ───────────────────────────────────────────────────
function ActionPill({
  children, color, borderColor, textColor, onClick, active = false,
}: {
  children: React.ReactNode
  color?: string
  borderColor?: string
  textColor?: string
  onClick?: () => void
  active?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:       'inline-flex',
        alignItems:    'center',
        gap:           5,
        padding:       '4px 10px',
        fontSize:      11,
        fontWeight:    700,
        background:    active ? (color ?? 'var(--secondary-background)') : (hov ? (color ?? 'var(--bg3, #e8e4dc)') : 'var(--secondary-background)'),
        color:         active ? (textColor ?? 'var(--foreground)') : 'var(--foreground)',
        border:        `1.5px solid ${borderColor ?? 'var(--border)'}`,
        borderRadius:  4,
        cursor:        onClick ? 'pointer' : 'default',
        transition:    'all .1s',
        fontFamily:    'inherit',
        letterSpacing: '.04em',
      }}
    >
      {children}
    </button>
  )
}

// ─── IO badge ────────────────────────────────────────────────────────────────
function IOBadge({ pts }: { pts: number }) {
  if (!pts) return null
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           4,
      padding:       '2px 8px',
      borderRadius:  4,
      background:    'var(--background)',
      border:        '1.5px solid var(--c-goal, #F59E0B)',
      boxShadow:     'var(--shadow-nb-sm, 2px 2px 0 #1a1814)',
      fontSize:      11,
      fontWeight:    700,
    }}>
      <svg viewBox="0 0 24 24" width={10} height={10} style={{ fill: 'var(--c-goal, #F59E0B)', flexShrink: 0 }}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
      <span style={{ color: 'var(--c-goal, #F59E0B)' }}>+{pts}</span>
    </span>
  )
}

// ─── Streak mini-calendar (7 dias) ───────────────────────────────────────────
function StreakMini({
  streak, colors,
}: {
  streak: number
  colors: ReturnType<typeof useTypeColors>
}) {
  return (
    <div style={{
      padding:     '10px 12px',
      borderTop:   `1px solid ${colors.border}`,
      background:  colors.bg2,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>
          {streak}
        </span>
        <span style={{ fontSize: 12, color: 'var(--foreground)', opacity: .65 }}>
          dias seguidos · meta: 7
        </span>
      </div>
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{
            width:        18,
            height:       18,
            borderRadius: 3,
            background:   i <= streak ? colors.badge : 'var(--background)',
            border:       `1px solid ${i <= streak ? colors.border : 'var(--border)'}`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Progress bar de meta ────────────────────────────────────────────────────
function GoalProgress({
  current, total, colors,
}: {
  current: number; total: number; colors: ReturnType<typeof useTypeColors>
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div style={{ padding: '0 12px 10px' }}>
      <div style={{
        height:       6,
        background:   'var(--background)',
        borderRadius: 3,
        overflow:     'hidden',
        border:       '1px solid var(--b2, #c5bfb0)',
      }}>
        <div style={{ height: '100%', background: colors.badge, width: `${pct}%` }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: colors.badge }}>{current}</span>
        <span style={{ fontSize: 11, opacity: .65 }}>{pct}% · meta {total}</span>
      </div>
    </div>
  )
}

// ─── Componente principal HabitCard ──────────────────────────────────────────
export interface HabitCardProps {
  habit:       Habit
  onToggle:    (id: number) => void
  onDelete:    (id: number) => void
  onEdit:      (h: Habit) => void
  updateHabit: (h: Habit) => void
  done?:       boolean
  preview?:    boolean
  isDark?:     boolean
}

export function HabitCard({
  habit, onToggle, onDelete, onEdit, updateHabit,
  done = false, preview = false, isDark = false,
}: HabitCardProps) {
  const listType  = (habit as any).listType ?? 'habito'
  const colors    = useTypeColors(listType, isDark)
  const [expanded, setExpanded]           = useState(false)
  const [activePanel, setActivePanel]     = useState<string | null>(null)
  const [showListMenu, setShowListMenu]   = useState(false)

  const streak    = (habit as any).streak ?? 0
  const goalMeta  = (habit as any).goalMeta  // { current, total } opcional

  const TYPE_LABEL: Record<string, string> = {
    habito: 'hábito', meta: 'meta', tarefa: 'tarefa', evento: 'evento',
  }

  const LIST_TYPES = ['habito', 'meta', 'tarefa', 'evento']
  const LIST_COLORS: Record<string, string> = {
    habito: 'var(--c-habit, #F5EFDF)',
    meta:   'var(--c-goal, #F59E0B)',
    tarefa: 'var(--c-task, #6FB8FF)',
    evento: 'var(--c-event, #9B7BFF)',
  }

  function togglePanel(id: string) {
    setActivePanel(prev => prev === id ? null : id)
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{
        background:  'var(--secondary-background)',
        color:       'var(--foreground)',
        border:      `2px solid ${colors.border}`,
        borderRadius: 5,
        boxShadow:   'var(--shadow)',
        display:     'flex',
        flexDirection: 'column',
        opacity:     done ? .75 : 1,
      }}>

        {/* ── Header ── */}
        <div style={{ padding: 12, display: 'flex', gap: 10 }}>

          {/* Checkbox */}
          {!preview && (
            <div
              onClick={() => onToggle(habit.id)}
              style={{
                width:          17,
                height:         17,
                borderRadius:   4,
                border:         `2px solid ${colors.border}`,
                background:     done ? colors.badge : 'var(--secondary-background)',
                flexShrink:     0,
                marginTop:      2,
                cursor:         'pointer',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                transition:     'background .1s',
              }}
            >
              {done && (
                <Check size={9} weight="bold" style={{ color: colors.badgeText }} />
              )}
            </div>
          )}

          {/* Corpo */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges + IO + hora */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
              {/* Badge de tipo */}
              <span style={{
                display:       'inline-flex',
                alignItems:    'center',
                padding:       '2px 8px',
                borderRadius:  4,
                fontSize:      10,
                fontWeight:    700,
                background:    colors.badge,
                color:         colors.badgeText,
                border:        `1.5px solid ${colors.border}`,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
              }}>
                {TYPE_LABEL[listType] ?? listType}
              </span>

              {/* IO */}
              <IOBadge pts={habit.pts} />

              {/* Freq tag */}
              <span style={{
                fontSize:   10,
                color:      'var(--foreground)',
                opacity:    .55,
                fontFamily: 'monospace',
              }}>
                {habit.freq === 'diario' ? 'diário'
                 : habit.freq === 'semanal' ? 'semanal'
                 : `${habit.days?.length ?? 0}d/sem`}
              </span>

              {/* Expand toggle */}
              {!preview && (
                <button
                  onClick={() => setExpanded(v => !v)}
                  style={{
                    marginLeft:     'auto',
                    background:     'none',
                    border:         'none',
                    cursor:         'pointer',
                    color:          'var(--foreground)',
                    opacity:        .5,
                    display:        'flex',
                    alignItems:     'center',
                    padding:        '0 2px',
                  }}
                >
                  {expanded ? <CaretUp size={13} /> : <CaretDown size={13} />}
                </button>
              )}
            </div>

            {/* Nome */}
            <div style={{
              fontSize:       14,
              fontWeight:     600,
              textDecoration: done ? 'line-through' : 'none',
              opacity:        done ? .6 : 1,
              lineHeight:     1.3,
            }}>
              {habit.name}
            </div>

            {/* Nota */}
            {habit.notes && (
              <div style={{ fontSize: 12, opacity: .65, marginTop: 4, lineHeight: 1.4 }}>
                {habit.notes}
              </div>
            )}
          </div>
        </div>

        {/* ── Progress de meta (se existir) ── */}
        {goalMeta && (
          <GoalProgress
            current={goalMeta.current}
            total={goalMeta.total}
            colors={colors}
          />
        )}

        {/* ── Action pills por tipo ── */}
        {!preview && !done && (
          <div style={{
            padding:    '0 12px 10px',
            display:    'flex',
            flexWrap:   'wrap',
            gap:        6,
            alignItems: 'center',
          }}>
            {listType === 'habito' && (
              <>
                <ActionPill
                  color={colors.bg}
                  borderColor={colors.border}
                  textColor={colors.badgeText}
                  active={activePanel === 'streak'}
                  onClick={() => togglePanel('streak')}
                >
                  <ArrowClockwise size={12} weight="bold" /> streak
                </ActionPill>
                <ActionPill
                  active={activePanel === 'calendario'}
                  onClick={() => togglePanel('calendario')}
                >
                  <CalendarBlank size={12} weight="bold" /> calendário
                </ActionPill>
                <ActionPill
                  active={activePanel === 'grafico'}
                  onClick={() => togglePanel('grafico')}
                >
                  <ChartBar size={12} weight="bold" /> gráfico
                </ActionPill>
              </>
            )}

            {listType === 'meta' && (
              <>
                <ActionPill
                  color={colors.bg}
                  borderColor={colors.border}
                  textColor={colors.badgeText}
                  active={activePanel === 'progresso'}
                  onClick={() => togglePanel('progresso')}
                >
                  <ChartBar size={12} weight="bold" /> progresso
                </ActionPill>
                <ActionPill
                  active={activePanel === 'tabela'}
                  onClick={() => togglePanel('tabela')}
                >
                  <CalendarBlank size={12} weight="bold" /> tabela
                </ActionPill>
              </>
            )}

            {listType === 'tarefa' && (
              <>
                <ActionPill
                  color={colors.bg}
                  borderColor={colors.border}
                  textColor={colors.badgeText}
                  active={activePanel === 'prioridade'}
                  onClick={() => togglePanel('prioridade')}
                >
                  <WarningCircle size={12} weight="bold" /> prioridade
                </ActionPill>
                <ActionPill
                  active={activePanel === 'kanban'}
                  onClick={() => togglePanel('kanban')}
                >
                  <Kanban size={12} weight="bold" /> kanban
                </ActionPill>
              </>
            )}

            {listType === 'evento' && (
              <>
                <ActionPill
                  color={colors.bg}
                  borderColor={colors.border}
                  textColor={colors.badgeText}
                  active={activePanel === 'agendar'}
                  onClick={() => togglePanel('agendar')}
                >
                  <CalendarBlank size={12} weight="bold" /> agendar
                </ActionPill>
              </>
            )}

            {/* Botão ··· sempre no final */}
            <div style={{ marginLeft: 'auto' }}>
              <ActionPill onClick={() => setExpanded(v => !v)}>
                <DotsThree size={14} weight="bold" />
              </ActionPill>
            </div>
          </div>
        )}

        {/* ── Streak footer ── */}
        {activePanel === 'streak' && listType === 'habito' && (
          <StreakMini streak={streak} colors={colors} />
        )}

        {/* ── Calendário panel ── */}
        {activePanel === 'calendario' && (
          <div style={{
            padding:     '10px 12px',
            borderTop:   `1px solid ${colors.border}`,
            background:  colors.bg2,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
              {['D','S','T','Q','Q','S','S'].map((d, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 9, opacity: .5, marginBottom: 2 }}>{d}</div>
                  <div style={{
                    height:       18,
                    borderRadius: 3,
                    background:   habit.days?.includes(i) ? colors.badge : 'var(--background)',
                    border:       `1px solid ${habit.days?.includes(i) ? colors.border : 'var(--border)'}`,
                  }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Expanded — edição/delete ── */}
        {expanded && !preview && (
          <div style={{
            padding:     '0 12px 12px',
            display:     'flex',
            gap:         8,
            flexWrap:    'wrap',
            borderTop:   `1px solid ${colors.border}`,
            paddingTop:  10,
          }}>
            {/* Editar */}
            <button
              onClick={() => { onEdit(habit); setExpanded(false) }}
              style={{
                flex:           1,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            5,
                padding:        '7px 0',
                background:     colors.bg,
                color:          colors.badgeText,
                border:         `2px solid ${colors.border}`,
                boxShadow:      'var(--shadow-nb-sm)',
                borderRadius:   4,
                fontWeight:     700,
                fontSize:       11,
                cursor:         'pointer',
                fontFamily:     'inherit',
              }}
            >
              <PencilSimple size={12} weight="bold" /> Editar
            </button>

            {/* Mudar tipo */}
            <button
              onClick={() => setShowListMenu(v => !v)}
              style={{
                flex:           1,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            5,
                padding:        '7px 0',
                background:     'var(--secondary-background)',
                color:          'var(--foreground)',
                border:         '2px solid var(--border)',
                boxShadow:      'var(--shadow-nb-sm)',
                borderRadius:   4,
                fontWeight:     700,
                fontSize:       11,
                cursor:         'pointer',
                fontFamily:     'inherit',
              }}
            >
              Tipo de lista
            </button>

            {/* Excluir */}
            <button
              onClick={() => onDelete(habit.id)}
              style={{
                flex:           1,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                gap:            5,
                padding:        '7px 0',
                background:     'var(--destructive-pastel, #FF6B6B)',
                color:          'var(--destructive-pastel-foreground, #fff)',
                border:         '2px solid var(--border)',
                boxShadow:      'var(--shadow-nb-sm)',
                borderRadius:   4,
                fontWeight:     700,
                fontSize:       11,
                cursor:         'pointer',
                fontFamily:     'inherit',
              }}
            >
              <Trash size={12} weight="bold" /> Excluir
            </button>

            {/* Menu de tipo */}
            {showListMenu && (
              <div style={{
                width:          '100%',
                display:        'flex',
                gap:            6,
                flexWrap:       'wrap',
              }}>
                {LIST_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      updateHabit({ ...habit, listType: t } as any)
                      setShowListMenu(false)
                      setExpanded(false)
                    }}
                    style={{
                      flex:           1,
                      padding:        '6px 0',
                      background:     LIST_COLORS[t],
                      color:          '#111',
                      border:         '2px solid var(--border)',
                      borderRadius:   4,
                      fontWeight:     700,
                      fontSize:       11,
                      cursor:         'pointer',
                      fontFamily:     'inherit',
                      minWidth:       60,
                    }}
                  >
                    {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}