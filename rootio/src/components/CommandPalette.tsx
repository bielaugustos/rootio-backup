'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

/* ── COMMAND PALETTE ── */
const getCommandPaletteStyles = (themeMode: 'light' | 'dark') => `
.cmd-ov{background:transparent;padding:0;border-radius:8px}
.ds-root.light .cmd-ov{background:rgba(0,0,0,.25)}
.cmd-box{background:${themeMode === 'dark' ? '#1E1E1E' : '#fff'};border:2px solid #111;border-radius:8px;overflow:hidden;box-shadow:4px 4px 0 0 #111}
.cmd-ir{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #111}
.cmd-inp{flex:1;background:transparent;border:none;outline:none;font-size:14px;font-weight:600;color:${themeMode === 'dark' ? '#fff' : '#111'};font-family:inherit}
.cmd-inp::placeholder{color:${themeMode === 'dark' ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)'}}
.cmd-sec{padding:6px 0}
.cmd-actions{background:${themeMode === 'dark' ? '#2a2a2a' : '#f0f0f0'};border-radius:4px;margin:0}
.cmd-sl{font-size:9px;font-weight:700;letter-spacing:.1em;color:${themeMode === 'dark' ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)'};text-transform:uppercase;padding:4px 14px 5px}
.cmd-i{display:flex;align-items:center;gap:10px;padding:7px 14px;cursor:pointer;transition:all .12s}
.cmd-i:hover,.cmd-i.foc{background:${themeMode === 'dark' ? '#333333' : '#e0e0e0'}}
.cmd-ico{width:30px;height:30px;border-radius:4px;border:2px solid #000;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:2px 2px 0 #111}
.cmd-txt{flex:1}
.cmd-title{font-size:13px;font-weight:700;color:${themeMode === 'dark' ? '#fff' : '#111'}}
.cmd-sub{font-size:11px;color:${themeMode === 'dark' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.6)'}}
.cmd-kbd{font-size:10px;color:${themeMode === 'dark' ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)'};background:${themeMode === 'dark' ? '#444444' : '#e8e8e8'};border:0.5px solid ${themeMode === 'dark' ? '#555555' : '#cccccc'};border-radius:3px;padding:2px 5px;font-family:monospace}
.cmd-ft{padding:8px 14px;border-top:1px solid #111;display:flex;align-items:center;gap:10px}
.kbd{font-size:10px;color:${themeMode === 'dark' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.6)'};background:${themeMode === 'dark' ? '#333333' : '#e0e0e0'};border:0.5px solid ${themeMode === 'dark' ? '#555555' : '#cccccc'};border-radius:3px;padding:1px 5px;font-family:monospace}
.cmd-hint{font-size:10px;color:${themeMode === 'dark' ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.4)'};display:flex;align-items:center;gap:4px}
`

// Styles will be injected per component instance

function Icon({ name, size = 16, style = {}, invertInDark = true }: { name: string; size?: number; style?: React.CSSProperties; invertInDark?: boolean }) {
  return (
    <img
      src={`/icons/phosphor/regular/${name}.svg`}
      alt={name}
      width={size}
      height={size}
      className={invertInDark ? "dark:invert" : ""}
      style={{ display: 'inline-block', ...style }}
    />
  )
}

function IconCustom({ name, size = 16, style = {} }: { name: string; size?: number; style?: React.CSSProperties }) {
  const icons: Record<string, (style: React.CSSProperties) => React.ReactNode> = {
    'io-star': (style) => (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={style.fill || '#F59E0B'} />
      </svg>
    ),
    'pill-streak': (style) => (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth="2.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),

    'pill-progresso': (style) => (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="3" y1="20" x2="21" y2="20"></line><rect x="4" y="12" width="4" height="8"></rect><rect x="10" y="7" width="4" height="13"></rect>
      </svg>
    ),

    'pill-kanban': (style) => (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="3" width="5" height="18" rx="1"></rect><rect x="10" y="3" width="5" height="12" rx="1"></rect>
      </svg>
    ),
    'pill-calendar': (style) => (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="4" width="18" height="17" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line>
      </svg>
    ),


    'pill-mais': (style) => (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
      </svg>
    ),
    'btn-executar': (style) => (
      <svg viewBox="0 0 256 256" width={size} height={size} style={style}>
        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm37.66,109.66-48,48a8,8,0,0,1-11.32-11.32L148.69,128,106.34,85.66a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,165.66,133.66Z" fill="currentColor" />
      </svg>
    ),
    'btn-settings': (style) => (
      <svg viewBox="0 0 256 256" width={size} height={size} style={style}>
        <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40Q128,40,125.84,40L107.2,25.08a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.48a8,8,0,0,0-3.93,6L67.32,64.19q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.08,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Z" fill="currentColor" />
      </svg>
    ),
    'btn-nova-lista': (style) => (
      <svg viewBox="0 0 256 256" width={size} height={size} style={style}>
        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" fill="currentColor" />
      </svg>
    ),
    'inp-buscar': (style) => (
      <svg viewBox="0 0 24 24" width={size} height={size} style={style} fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  }
  return icons[name]?.(style) || null
}

export function CommandPalette({
  themeMode,
  canAdd,
  addHabit,
  earnIO,
  plan
}: {
  themeMode: 'light' | 'dark'
  canAdd: boolean
  addHabit: (habit: any) => void
  earnIO: (action: string) => void
  plan: string
}) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState<number | null>(0)

  // Inject styles on mount
  useEffect(() => {
    const styleId = `cmd-styles-${themeMode}`
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = getCommandPaletteStyles(themeMode)
      document.head.appendChild(style)
    }
  }, [themeMode])

  const actions = [
    { key: 'P', title: 'planejar', subtitle: 'criar um plano com etapas e prazo', bg: '#F5EFDF', icon: 'btn-executar' },
    { key: 'E', title: 'executar', subtitle: 'registrar o que você fez agora', bg: '#F59E0B', icon: 'btn-executar' },
    { key: 'A', title: 'agendar', subtitle: 'definir data, hora e lembrete', bg: '#6FB8FF', icon: 'pill-calendar' },
    { key: 'T', title: 'escolher tipo', subtitle: 'hábito · evento · meta · tarefa · nota', bg: '#9B7BFF', icon: 'btn-nova-lista' },
  ]

  const navigate = [
    { key: 'F', title: 'ir para ../projetos', subtitle: 'Time Design', bg: themeMode === 'dark' ? '#1E1E1E' : '#f0f0f0', border: '#111', icon: 'btn-nova-lista' },
    { key: 'D', title: 'ir para ../hoje', subtitle: 'dashboard', bg: themeMode === 'dark' ? '#1E1E1E' : '#f0f0f0', border: '#111', icon: 'inp-buscar' },
  ]

  return (
    <div className="cmd-ov">
      <div className="cmd-box" style={{ width: '100%' }}>
        <div className="cmd-ir">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="cmd-inp"
            placeholder="o que você fez ou quer fazer?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement
                const habitName = target.value.trim()
                if (habitName) {
                  if (!canAdd) {
                    toast.error(`Limite de 10 hábitos no plano Free.`)
                    return
                  }
                  addHabit({
                    id: Date.now(),
                    name: habitName,
                    priority: 'media',
                    freq: 'diario',
                    days: [0,1,2,3,4,5,6],
                    notes: '',
                    pts: 0,
                    done: false,
                    icon: '⭐',
                    tags: [],
                    streak: 0,
                    createdAt: new Date().toISOString()
                  })
                  earnIO('input_registro')
                  toast.success('+10 IO • hábito criado!')
                  target.value = ''
                  setQuery('')
                }
              }
            }}
          />
        </div>
        {query.trim() && (
          <>
            <div className="cmd-sl">ações rápidas</div>
            <div className="cmd-sec cmd-actions">
              {actions.map((action, i) => (
                <div
                  key={i}
                  className={`cmd-i ${focused === i ? 'foc' : ''}`}
                  onMouseEnter={() => setFocused(i)}
                  onMouseLeave={() => setFocused(null)}
                  onClick={() => setFocused(focused === i ? null : i)}
                >
                  <div className="cmd-ico" style={{ background: action.bg }}>
                    <IconCustom name={action.icon} size={15} style={{ color: 'black' }} />
                  </div>
                  <div className="cmd-txt">
                    <div className="cmd-title">{action.title}</div>
                    <div className="cmd-sub">{action.subtitle}</div>
                  </div>
                  <span className="cmd-kbd">{action.key}</span>
                </div>
              ))}
            </div>
            <div className="cmd-sec" style={{ borderTop: '0.5px solid var(--b)' }}>
              <div className="cmd-sl">navegar</div>
              {navigate.map((item, j) => (
                <div
                  key={j}
                  className={`cmd-i ${focused === j + actions.length ? 'foc' : ''}`}
                  onMouseEnter={() => setFocused(j + actions.length)}
                  onMouseLeave={() => setFocused(null)}
                  onClick={() => setFocused(focused === j + actions.length ? null : j + actions.length)}
                >
                  <div className="cmd-ico" style={{ background: item.bg, boxShadow: 'none' }}>
                    <IconCustom name={item.icon} size={13} style={{ opacity: .7, color: 'var(--t2)' }} />
                  </div>
                  <div className="cmd-txt">
                    <div className="cmd-title">{item.title}</div>
                    <div className="cmd-sub">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="cmd-ft">
          <div className="cmd-hint">
            <span className="kbd">↑↓</span> navegar
          </div>
          <div className="cmd-hint">
            <span className="kbd">↵</span> selecionar
          </div>
          <div className="cmd-hint">
            <span className="kbd">esc</span> fechar
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--t4)', fontFamily: 'monospace' }}>⌘K</div>
        </div>
      </div>
    </div>
  )
}