'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'

/* ── COMMAND PALETTE ── */
const commandPaletteStyles = `
.cmd-ov{background:rgba(0,0,0,.6);padding:16px;border-radius:8px}
.ds-root.light .cmd-ov{background:rgba(0,0,0,.25)}
.cmd-box{background:var(--bg2);border:2px solid var(--b2);border-radius:8px;overflow:hidden;box-shadow:6px 6px 0 var(--b)}
.cmd-ir{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--b)}
.cmd-inp{flex:1;background:transparent;border:none;outline:none;font-size:14px;font-weight:600;color:var(--t1);font-family:inherit}
.cmd-inp::placeholder{color:var(--t4)}
.cmd-sec{padding:6px 0}
.cmd-actions{background:var(--bg3);border-radius:4px;margin:0 8px}
.cmd-sl{font-size:9px;font-weight:700;letter-spacing:.1em;color:var(--t4);text-transform:uppercase;padding:4px 14px 5px}
.cmd-i{display:flex;align-items:center;gap:10px;padding:7px 14px;cursor:pointer;transition:all .12s}
.cmd-i:hover,.cmd-i.foc{background:var(--bg4)}
.cmd-ico{width:30px;height:30px;border-radius:4px;border:2px solid #000;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:var(--shadow-nb-sm)}
.cmd-txt{flex:1}
.cmd-title{font-size:13px;font-weight:700;color:var(--t1)}
.cmd-sub{font-size:11px;color:var(--t3)}
.cmd-kbd{font-size:10px;color:var(--t4);background:var(--bg5);border:0.5px solid var(--b3);border-radius:3px;padding:2px 5px;font-family:monospace}
.cmd-ft{padding:8px 14px;border-top:1px solid var(--b);display:flex;align-items:center;gap:10px}
.kbd{font-size:10px;color:var(--t3);background:var(--bg4);border:0.5px solid var(--b3);border-radius:3px;padding:1px 5px;font-family:monospace}
.cmd-hint{font-size:10px;color:var(--t4);display:flex;align-items:center;gap:4px}
`

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = commandPaletteStyles
  document.head.appendChild(style)
}

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
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={style.fill || 'var(--c-goal)'} />
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
const DEFAULT_LIGHT = {
  '--background':             'oklch(96.896% 0.01327 97.5)',
  '--secondary-background':   'oklch(100% 0 0)',
  '--foreground':             'oklch(0% 0 0)',
  '--main-foreground':        'oklch(0% 0 0)',
  '--main':                   'oklch(84.08% 0.1725 84.2)',
  '--border':                 'oklch(0% 0 0)',
  '--b2':                    '#c5bfb0',
  '--shadow':                 '4px 4px 0px 0px var(--border)',
  '--shadow-nb':              '4px 4px 0 #1a1814',
  '--shadow-nb-sm':          '2px 2px 0 #1a1814',
  '--boxShadowX':             '4px',
  '--boxShadowY':             '4px',
  '--reverseBoxShadowX':      '-4px',
  '--reverseBoxShadowY':      '-4px',
  '--destructive-pastel':     '#ef593b',
  '--destructive-pastel-foreground': 'oklch(0% 0 0)',
  '--bg2':                    '#f2f2f2',
  '--bg3':                    '#e8e4dc',
  '--bg4':                    '#ebe7db',
  '--b3':                    '#a09890',
  '--b-focus':               '#666666',
  '--t4':                     '#666666',
  '--c-habit':                '#F5EFDF',
  '--c-habit-b':              '#D4C9A9',
  '--c-habit-t':              '#0C0C0C',
  '--c-goal':                 '#F59E0B',
  '--c-goal-b':               '#92400E',
  '--c-goal-t':               '#92400E',
  '--c-task':                 '#6FB8FF',
  '--c-task-b':               '#1D4ED8',
  '--c-task-t':               '#1E3A8A',
  '--c-event':                '#9B7BFF',
  '--c-event-b':              '#5B21B6',
  '--c-event-t':              '#3730A3',
  '--c-note-bg':              '#F3F4F6',
  '--c-note-t':               '#374151',
}

const DEFAULT_DARK = {
  '--background':             '#0c0c0c',
  '--secondary-background':   '#141414',
  '--foreground':             '#ececec',
  '--main-foreground':        '#000000',
  '--main':                   'oklch(77.7% 0.1594 84.38)',
  '--border':                 '#2a2a2a',
  '--b':                      '#2a2a2a',
  '--b2':                    '#333333',
  '--b3':                    '#444444',
  '--b-focus':               '#888888',
  '--t1':                    '#ececec',
  '--t2':                    '#a8a8a8',
  '--t3':                    '#666666',
  '--t4':                    '#444444',
  '--shadow':                 '4px 4px 0px 0px #0c0c0c',
  '--shadow-nb':              '4px 4px 0 #0c0c0c',
  '--shadow-nb-sm':          '2px 2px 0 #0c0c0c',
  '--boxShadowX':             '4px',
  '--boxShadowY':             '4px',
  '--reverseBoxShadowX':      '-4px',
  '--reverseBoxShadowY':      '-4px',
  '--destructive-pastel':     '#fee2e2',
  '--destructive-pastel-foreground': '#7f1d1d',
  '--bg2':                    '#141414',
  '--bg3':                    '#1a1a1a',
  '--bg4':                    '#222222',
  '--bg5':                    '#2a2a2a',
  '--c-habit':                '#F5EFDF',
  '--c-habit-b':              '#b8a97a',
  '--c-habit-t':              '#000000',
  '--c-goal':                 '#F59E0B',
  '--c-goal-b':               '#4a3500',
  '--c-goal-t':               '#000000',
  '--c-task':                 '#6FB8FF',
  '--c-task-b':               '#1a3d60',
  '--c-task-t':               '#000000',
  '--c-event':                '#9B7BFF',
  '--c-event-b':              '#2e1f60',
  '--c-event-t':              '#000000',
  '--c-note-bg':              '#181818',
  '--c-note-t':               '#aaaaaa',
  '--c-habit-bg':            '#1e1c16',
  '--c-goal-bg':             '#1f1500',
  '--c-task-bg':             '#0a1825',
  '--c-event-bg':            '#130e24',
}

// Tokens que têm color picker direto
const COLOR_TOKENS = [
  { key: '--main',                     label: 'Main (brand)',          hint: 'Cor primária dos botões e badges' },
  { key: '--main-foreground',          label: 'Main foreground',       hint: 'Texto sobre o main' },
  { key: '--background',               label: 'Background',            hint: 'Fundo da página' },
  { key: '--secondary-background',     label: 'Secondary bg',          hint: 'Fundo de cards e inputs' },
  { key: '--foreground',               label: 'Foreground',            hint: 'Texto principal' },
  { key: '--border',                   label: 'Border',                hint: 'Cor de todas as bordas' },
  { key: '--destructive-pastel',       label: 'Destructive',           hint: 'Ações destrutivas' },
  { key: '--destructive-pastel-foreground', label: 'Destructive fg',   hint: 'Texto sobre destructive' },
]

const SHADOW_TOKENS = [
  { key: '--boxShadowX',         label: 'Shadow X',         type: 'range', min: 0, max: 12, unit: 'px' },
  { key: '--boxShadowY',         label: 'Shadow Y',         type: 'range', min: 0, max: 12, unit: 'px' },
  { key: '--reverseBoxShadowX',  label: 'Reverse shadow X', type: 'range', min: -12, max: 0, unit: 'px' },
  { key: '--reverseBoxShadowY',  label: 'Reverse shadow Y', type: 'range', min: -12, max: 0, unit: 'px' },
]

// Utilitário: converte oklch para hex aproximado para o color picker
function oklchToHex(val: string): string {
  const hex: Record<string, string> = {
    'oklch(0% 0 0)':               '#000000',
    'oklch(100% 0 0)':             '#ffffff',
    'oklch(84.08% 0.1725 84.2)':   '#ffbf00',
    'oklch(77.7% 0.1594 84.38)':   '#e6ac00',
    'oklch(96.896% 0.01327 97.5)': '#f7f4ec',
    'oklch(14.958% 0.00002 271.152)': '#1e1e22',
    'oklch(23.93% 0 0)':           '#3d3d3d',
    'oklch(92.49% 0 0)':           '#ecebeb',
  }
  if (hex[val]) return hex[val]
  if (val.startsWith('#')) return val
  return '#888888'
}

function hexToOklch(hex: string, originalOklch: string): string {
  // Se era oklch, tenta manter o formato com o hex como fallback
  // Para simplicidade, retornamos o hex direto — funciona em todos os browsers modernos
  return hex
}

// ─── Hook: aplica tokens ao :root ────────────────────────────────────────────
function useThemeTokens(isDark: boolean) {
  const [lightTokens, setLightTokens] = useState({ ...DEFAULT_LIGHT })
  const [darkTokens,  setDarkTokens]  = useState({ ...DEFAULT_DARK  })
  const previewRef = useRef<HTMLDivElement>(null)

  const tokens = isDark ? darkTokens : lightTokens
  const setTokens = isDark ? setDarkTokens : setLightTokens

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateToken = useCallback((key: string, value: string) => {
    setTokens((prev: any) => ({ ...prev, [key]: value }))
  }, [setTokens])

  const reset = useCallback(() => {
    setLightTokens({ ...DEFAULT_LIGHT })
    setDarkTokens({ ...DEFAULT_DARK  })
  }, [])

  // Aplica tokens no elemento de preview via style attribute
  const cssVars = Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')

  // Gera o CSS exportável
  const exportCSS = `:root {\n${
    Object.entries(lightTokens).map(([k,v]) => `  ${k}: ${v};`).join('\n')
  }\n}\n\n.dark {\n${
    Object.entries(darkTokens).map(([k,v]) => `  ${k}: ${v};`).join('\n')
  }\n}`

  return { tokens, updateToken, reset, cssVars, exportCSS, previewRef }
}

// ─── Componentes de preview ───────────────────────────────────────────────────
// Replicam button.tsx, badge.tsx, card.tsx, input.tsx usando CSS vars inline

function PreviewButton({
  children, variant = 'default', size = 'default', disabled = false, isDark = false, title, style,
}: {
  children: React.ReactNode
  variant?: 'default' | 'noShadow' | 'neutral' | 'reverse' | 'destructive' | 'primary' | 'habit' | 'task' | 'event' | 'ghost' | 'danger'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  isDark?: boolean
  title?: string
  style?: React.CSSProperties
}) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: size === 'icon' ? 0 : 8, fontWeight: 700, fontSize: 14,
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-base, 5px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? .5 : 1,
    transition: 'transform .1s, box-shadow .1s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    padding: size === 'icon' ? 0 : size === 'lg' ? '0 32px' : size === 'sm' ? '0 12px' : '0 18px',
    height: size === 'lg' ? 44 : size === 'sm' ? 36 : 40,
    width: size === 'icon' ? 40 : undefined,
  }

  const variants: Record<string, React.CSSProperties> = {
    default:     { background: 'var(--main)',     color: 'black' },
    noShadow:    { background: 'var(--main)',     color: isDark ? 'white' : 'black' },
    neutral:     { background: 'var(--secondary-background)', color: isDark ? 'white' : 'black' },
    reverse:     { background: 'var(--main)',     color: isDark ? 'white' : 'black' },
    destructive: { background: 'var(--destructive-pastel)', color: 'black' },
    primary:    { background: '#e6ac00', color: '#000000' },

    habit:      { background: 'var(--c-habit)', color: 'black' },

    task:       { background: 'var(--c-task)', color: 'black' },

    event:      { background: 'var(--c-event)', color: 'black' },
    ghost:      { background: 'var(--secondary-background)', color: isDark ? 'white' : 'black', border: '2px solid var(--border)' },
    danger:     { background: 'var(--destructive-pastel)', color: 'var(--destructive-pastel-foreground)' },
  }

  const shadowX = 'var(--boxShadowX, 4px)'
  const shadowY = 'var(--boxShadowY, 4px)'
  const revX    = 'var(--reverseBoxShadowX, -4px)'
  const revY    = 'var(--reverseBoxShadowY, -4px)'

  let transform: string | undefined
  let boxShadow: string | undefined

  if (!disabled) {
    if (variant === 'danger') {
      boxShadow = (hovered || pressed) ? 'none' : '4px 4px 0 #ef593b'
      transform = (hovered || pressed) ? `translate(${shadowX}, ${shadowY})` : 'none'
    } else if (variant === 'default' || variant === 'neutral' || variant === 'destructive' || variant === 'primary' || variant === 'habit' || variant === 'task' || variant === 'event') {
      boxShadow = (hovered || pressed) ? 'none' : `var(--shadow)`
      transform = (hovered || pressed) ? `translate(${shadowX}, ${shadowY})` : 'none'
    } else if (variant === 'reverse') {
      boxShadow = (hovered || pressed) ? `var(--shadow)` : 'none'
      transform = (hovered || pressed) ? `translate(${revX}, ${revY})` : 'none'
    } else if (variant === 'ghost') {
      boxShadow = (hovered || pressed) ? 'none' : '4px 4px 0 var(--b2)'
      transform = (hovered || pressed) ? `translate(${shadowX}, ${shadowY})` : 'none'
    } else {
      boxShadow = 'none'
    }
  }

  return (
    <button
      disabled={disabled}
      title={title}
      style={{ ...base, ...variants[variant], boxShadow, transform, ...style }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {children}
    </button>
  )
}

function PreviewBadge({
  children, variant = 'default',
}: { children: React.ReactNode; variant?: 'default'|'secondary'|'outline'|'destructive' }) {
  const styles: Record<string, React.CSSProperties> = {
    default:     { background: 'var(--main)',     color: 'var(--main-foreground)' },
    secondary:   { background: 'var(--secondary-background)', color: 'var(--foreground)' },
    outline:     { background: 'transparent',     color: 'var(--foreground)' },
    destructive: { background: 'var(--destructive-pastel)', color: 'var(--destructive-pastel-foreground)' },
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', fontSize: 12, fontWeight: 500,
      border: '2px solid var(--border)', borderRadius: 5,
      ...styles[variant],
    }}>
      {children}
    </span>
  )
}

function PreviewInput({ placeholder, disabled = false, suffix, hasSearchIcon = false }: { placeholder?: string; disabled?: boolean; suffix?: string; hasSearchIcon?: boolean }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Input
        placeholder={placeholder}
        disabled={disabled}
        className={`transition-shadow duration-200 focus:shadow-nb shadow-none ${hasSearchIcon ? 'pl-10' : ''} ${suffix ? 'pl-12' : ''}`}
      />
      {hasSearchIcon && (
        <div style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, pointerEvents: 'none', color: 'var(--muted-foreground)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
      )}
      {suffix && (
        <span style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          fontSize: 13, fontWeight: 600, color: 'var(--foreground)', opacity: .7,
          pointerEvents: 'none', zIndex: 10,
        }}>
          {suffix}
        </span>
      )}
    </div>
  )
}

function PreviewCardExpanded({
  title, type = 'habit', io, time, description, notes, tags, streak, goalMeta, urgent, isDark = false,
}: {
  title: string
  type?: 'habit' | 'goal' | 'task' | 'event' | 'note'
  io?: string
  time?: string
  description?: string
  notes?: string
  tags?: string[]
  streak?: number
  goalMeta?: { current: string; percent: number; target: string }
  urgent?: boolean
  isDark?: boolean
}) {
  const [checked, setChecked] = useState(false)

  const typeColors: Record<string, { border: string; bg: string; badge: string; badgeText: string; bg2: string }> = {
    habit: { border: 'var(--c-habit-b)', bg: 'var(--c-habit)', badge: 'var(--c-habit)', badgeText: isDark ? 'white' : 'var(--c-habit-t)', bg2: 'var(--c-habit-bg)' },
    goal:  { border: 'var(--c-goal-b)',  bg: 'var(--c-goal)',  badge: 'var(--c-goal)',  badgeText: isDark ? 'white' : 'var(--c-goal-t)', bg2: 'var(--c-goal-bg)' },
    task:  { border: 'var(--c-task-b)',  bg: 'var(--c-task)',  badge: 'var(--c-task)',  badgeText: isDark ? 'white' : '#000', bg2: 'var(--c-task-bg)' },
    event: { border: 'var(--c-event-b)', bg: 'var(--c-event)', badge: 'var(--c-event)', badgeText: isDark ? 'white' : '#fff', bg2: 'var(--c-event-bg)' },
    note:  { border: 'var(--border)',  bg: 'var(--c-note-bg)', badge: 'var(--c-note-bg)', badgeText: 'var(--c-note-t)', bg2: 'var(--secondary-background)' },
  }
  const colors = typeColors[type]

  const getLabel = () => {
    const labels: Record<string, string> = {
      habit: 'hábito', goal: 'meta', task: 'tarefa', event: 'evento', note: 'nota'
    }
    return urgent && type === 'task' ? 'tarefa urgente' : labels[type || 'habit']
  }

  return (
    <div style={{
      background: 'var(--secondary-background)', color: 'var(--foreground)',
      border: `2px solid ${colors.border}`, borderRadius: 5,
      boxShadow: 'var(--shadow)', padding: 0,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ padding: 12, display: 'flex', gap: 10 }}>
        <div 
          onClick={() => setChecked(!checked)}
          style={{
            width: 17, height: 17, borderRadius: 4,
            border: `2px solid ${checked ? colors.border : colors.border}`,
            background: checked ? colors.badge : 'var(--secondary-background)',
            flexShrink: 0, marginTop: 2, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {checked && <Icon name="check-circle" size={10} style={{ color: colors.badgeText }} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
              background: colors.badge, color: colors.badgeText, border: `1.5px solid ${colors.border}`,
            }}>
              {getLabel()}
            </span>
            {io && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '2px 8px', borderRadius: 4,
                background: 'var(--background)',
                border: '1.5px solid var(--c-goal)',
                boxShadow: 'var(--shadow-nb-sm)',
                fontSize: 11, fontWeight: 700,
              }}>
                <IconCustom name="io-star" size={11} style={{ fill: 'var(--c-goal)' }} />
                <span style={{ color: 'var(--c-goal)' }}>{io}</span>
              </span>
            )}
            {time && (
              <span style={{
                fontSize: 10, color: 'var(--foreground)', opacity: .6,
                fontFamily: 'monospace', marginLeft: 'auto',
              }}>
                {time}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {title}
          </div>
        </div>
      </div>
      {description && (
        <div style={{ padding: '0 12px', fontSize: 12, opacity: .7, marginBottom: 4 }}>
          {description}
        </div>
      )}
      {notes && (
        <div style={{ padding: '0 12px', fontSize: 12, opacity: .8, marginBottom: 4 }}>
          {notes}
        </div>
      )}
      {goalMeta && (
        <div style={{ padding: '0 12px 0', marginBottom: 4 }}>
          <div style={{ height: 6, background: 'var(--background)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--b2)' }}>
            <div style={{ height: '100%', background: colors.badge, width: `${goalMeta.percent}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: colors.badge }}>{goalMeta.current}</span>
            <span style={{ fontSize: 11, opacity: .7 }}>{goalMeta.percent}% · meta {goalMeta.target}</span>
          </div>
        </div>
      )}
      {tags && tags.length > 0 && (
        <div style={{ padding: '0 12px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
{tags.map((tag, i) => (
            <span key={i} style={{
              padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
              background: i === 0 ? colors.badge : 'var(--secondary-background)',
              color: i === 0 ? colors.badgeText : 'var(--foreground)',
              border: i === 0 ? `1px solid ${colors.border}` : '1px solid var(--border)',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      {/* Action Pills */}
      {type === 'habit' && (
        <div style={{ padding: '0 12px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <PreviewPill variant="habit"><IconCustom name="pill-streak" size={12} /> streak</PreviewPill>
          <PreviewPill variant="default"><Icon name="calendar" size={12} style={isDark ? { filter: 'invert(1)' } : {}} /> calendário</PreviewPill>
          <PreviewPill variant="default"><IconCustom name="pill-calendar" size={12} /> gráfico</PreviewPill>
          <div style={{ marginLeft: 'auto' }}>
            <PreviewPill variant="default" size="sm"><IconCustom name="pill-mais" size={12} /></PreviewPill>
          </div>
        </div>
      )}
      {type === 'goal' && (
        <div style={{ padding: '0 12px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <PreviewPill variant="goal"><IconCustom name="pill-progresso" size={12} /> progresso</PreviewPill>
          <PreviewPill variant="default"><Icon name="table" size={12} style={isDark ? { filter: 'invert(1)' } : {}} /> tabela</PreviewPill>
          <div style={{ marginLeft: 'auto' }}>
            <PreviewPill variant="default" size="sm"><IconCustom name="pill-mais" size={12} /></PreviewPill>
          </div>
        </div>
      )}
      {type === 'task' && (
        <div style={{ padding: '0 12px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <PreviewPill variant="task"><Icon name="warning" size={12} invertInDark={false} /> prioridade</PreviewPill>
          <PreviewPill variant="default"><IconCustom name="pill-kanban" size={12} /> kanban</PreviewPill>
          <div style={{ marginLeft: 'auto' }}>
            <PreviewPill variant="default" size="sm"><IconCustom name="pill-mais" size={12} style={{ color: 'var(--foreground)' }} /></PreviewPill>
          </div>
        </div>
      )}
      {type === 'event' && (
        <div style={{ padding: '0 12px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <PreviewPill variant="event"><IconCustom name="pill-calendar" size={12} /> agendar</PreviewPill>
          <PreviewPill variant="default"><IconCustom name="pill-calendar" size={12} /> calendário</PreviewPill>
          <div style={{ marginLeft: 'auto' }}>
            <PreviewPill variant="default" size="sm"><IconCustom name="pill-mais" size={12} /></PreviewPill>
          </div>
        </div>
      )}
      {(type === 'note' || type === undefined) && (
        <div style={{ padding: '0 12px', display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          <div style={{ marginLeft: 'auto' }}>
            <PreviewPill variant="default" size="sm"><IconCustom name="pill-mais" size={12} /></PreviewPill>
          </div>
        </div>
      )}
      {/* Streak/Progress Footer */}
      {streak !== undefined && (
        <div style={{ padding: '10px 12px', borderTop: `1px solid ${colors.border}`, background: colors.bg2 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1 }}>{streak}</span>
            <span style={{ fontSize: 12, color: 'var(--foreground)' }}>dias seguidos · meta: 7</span>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} style={{
                width: 18, height: 18, borderRadius: 3,
                background: i <= streak ? colors.badge : 'var(--background)',
                border: i === 3 ? `2px solid var(--border)` : `1px solid ${i <= streak ? colors.border : 'var(--border)'}`,
                boxShadow: i === 3 ? 'var(--shadow-nb-sm)' : 'none',
              }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}



function PreviewCommandPalette() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState<number | null>(0)

  const actions = [
    { key: 'P', title: 'planejar', subtitle: 'criar um plano com etapas e prazo', bg: 'var(--c-habit)', icon: 'btn-executar' },
    { key: 'E', title: 'executar', subtitle: 'registrar o que você fez agora', bg: 'var(--c-goal)', icon: 'btn-executar' },
    { key: 'A', title: 'agendar', subtitle: 'definir data, hora e lembrete', bg: 'var(--c-task)', icon: 'pill-calendar' },
    { key: 'T', title: 'escolher tipo', subtitle: 'hábito · evento · meta · tarefa · nota', bg: 'var(--c-event)', icon: 'btn-nova-lista' },
  ]

  const navigate = [
    { key: 'F', title: 'ir para ../projetos', subtitle: 'Time Design', bg: 'var(--bg2)', border: 'var(--b2)', icon: 'btn-nova-lista' },
    { key: 'D', title: 'ir para ../hoje', subtitle: 'dashboard', bg: 'var(--bg2)', border: 'var(--b2)', icon: 'inp-buscar' },
  ]

  return (
    <div className="cmd-ov">
      <div className="cmd-box">
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
          />
        </div>
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

function PreviewTextarea({ placeholder, value }: { placeholder?: string; value?: string }) {
  return (
    <textarea
      placeholder={placeholder}
      defaultValue={value}
      style={{
        width: '100%', minHeight: 72, padding: '8px 12px', fontSize: 14,
        background: 'var(--secondary-background)', color: 'var(--foreground)',
        border: '2px solid var(--border)', borderRadius: 5,
        fontFamily: 'inherit', fontWeight: 500, lineHeight: 1.5,
        outline: 'none', resize: 'vertical',
      }}
    />
  )
}

function PreviewSelect({ disabled = false }: { disabled?: boolean }) {
  return (
    <select
      disabled={disabled}
      style={{
        height: 40, width: '100%', padding: '0 12px', fontSize: 14,
        background: 'var(--secondary-background)', color: 'var(--foreground)',
        border: '2px solid var(--border)', borderRadius: 5,
        fontFamily: 'inherit', fontWeight: 500, cursor: 'pointer',
        outline: 'none', appearance: 'none',
      }}
    >
      <option>hábito</option>
      <option>evento</option>
      <option>meta</option>
      <option>tarefa</option>
    </select>
  )
}

function PreviewCheckbox({ checked = false, type = 'goal' }: { checked?: boolean; type?: 'goal' | 'habit' | 'task' | 'event' }) {
  const [isChecked, setIsChecked] = useState(checked)

  const typeColors: Record<string, { bg: string; border: string; icon: string }> = {
    goal:  { bg: 'var(--c-goal)',  border: 'var(--c-goal-b)',  icon: 'var(--foreground)' },
    habit: { bg: 'var(--c-habit)', border: 'var(--c-habit-b)', icon: 'var(--foreground)' },
    task: { bg: 'var(--c-task)', border: 'var(--c-task-b)', icon: 'var(--foreground)' },
    event: { bg: 'var(--c-event)', border: 'var(--c-event-b)', icon: 'var(--foreground)' },
  }

  const colors = typeColors[type]

  return (
    <div
      onClick={() => setIsChecked(!isChecked)}
      style={{
        width: 17, height: 17, borderRadius: 4,
        border: `2px solid ${isChecked ? colors.border : 'var(--border)'}`,
        background: isChecked ? colors.bg : 'var(--secondary-background)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .12s',
      }}
    >
      {isChecked && (
        <Icon name="check-circle" size={10} style={{ color: colors.icon }} />
      )}
    </div>
  )
}

function PreviewRadio({ checked = false, type = 'goal' }: { checked?: boolean; type?: 'goal' | 'habit' | 'task' | 'event' }) {
  const [isChecked, setIsChecked] = useState(checked)

  const typeColors: Record<string, { bg: string; border: string }> = {
    goal:  { bg: 'var(--c-goal)',  border: 'var(--c-goal-b)' },
    habit: { bg: 'var(--c-habit)', border: 'var(--c-habit-b)' },
    task: { bg: 'var(--c-task)', border: 'var(--c-task-b)' },
    event: { bg: 'var(--c-event)', border: 'var(--c-event-b)' },
  }

  const colors = typeColors[type]

  return (
    <div
      onClick={() => setIsChecked(!isChecked)}
      style={{
        width: 17, height: 17, borderRadius: '50%',
        border: `2px solid ${isChecked ? colors.border : 'var(--border)'}`,
        background: 'var(--secondary-background)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .12s',
      }}
    >
      {isChecked && (
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: colors.bg,
        }} />
      )}
    </div>
  )
}

function PreviewToggle({ checked = false }: { checked?: boolean }) {
  const [isChecked, setIsChecked] = useState(checked)

  return (
    <div
      onClick={() => setIsChecked(!isChecked)}
      style={{
        width: 36, height: 16, borderRadius: 10,
        border: '2px solid var(--border)',
        background: isChecked ? 'var(--c-goal)' : 'var(--background)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all .15s',
        flexShrink: 0,
        boxSizing: 'content-box',
      }}
    >
      <div style={{
        width: 12, height: 12, borderRadius: '50%',
        background: isChecked ? 'var(--foreground)' : 'var(--foreground)',
        position: 'absolute', top: 2, left: 2,
        transition: 'transform .15s',
        transform: isChecked ? 'translateX(16px)' : 'translateX(0)',
      }} />
    </div>
  )
}

function PreviewCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div style={{
      background: 'var(--secondary-background)', color: 'var(--foreground)',
      border: '2px solid var(--border)', borderRadius: 5,
      boxShadow: 'var(--shadow)', padding: 24,
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {children}
    </div>
  )
}

function PreviewPill({
  children, variant = 'default', size = 'default', style,
}: {
  children: React.ReactNode
  variant?: 'default' | 'habit' | 'goal' | 'task' | 'event'
  size?: 'default' | 'sm'
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)
  const [selected, setSelected] = useState(false)
  const [pressed, setPressed] = useState(false)

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: size === 'sm' ? '4px 10px' : '5px 12px',
    borderRadius: 4, fontSize: size === 'sm' ? 11 : 12,
    fontWeight: 700, cursor: 'pointer',
    transition: 'box-shadow .1s, transform .1s',
    fontFamily: 'inherit',
  }

  // Default: uses border (black) for border and shadow, but changes to b2 when selected
  const defaultStyles: React.CSSProperties = {
    background: 'var(--secondary-background)',
    color: 'var(--foreground)',
    border: '2px solid var(--border)',
    boxShadow: '4px 4px 0 var(--border)',
  }

  // Type pills: use border (ink/black) for border and shadow
  const typeStyles: Record<string, React.CSSProperties> = {
    habit: {
      background: 'var(--c-habit)',
      color: '#000000',
      border: '2px solid var(--border)',
      boxShadow: '4px 4px 0 var(--border)',
    },
    goal: {
      background: 'var(--c-goal)',
      color: '#000000',
      border: '2px solid var(--border)',
      boxShadow: '4px 4px 0 var(--border)',
    },
    task: {
      background: 'var(--c-task)',
      color: '#000000',
      border: '2px solid var(--border)',
      boxShadow: '4px 4px 0 var(--border)',
    },
    event: {
      background: 'var(--c-event)',
      color: '#000000',
      border: '2px solid var(--border)',
      boxShadow: '4px 4px 0 var(--border)',
    },
  }

  const isTypeVariant = variant !== 'default'
  const baseStyles = isTypeVariant ? typeStyles[variant] : defaultStyles

  // When selected: change border/shadow to b2 (gray) but keep in same position (no translate)
  const transform = (hovered || pressed) ? 'translate(4px, 4px)' : 'none'
  const boxShadow = (hovered || pressed) ? 'none' : (selected ? '4px 4px 0 var(--b2)' : baseStyles.boxShadow)
  const border = selected ? '2px solid var(--b2)' : baseStyles.border

  return (
    <button
      style={{ ...base, ...baseStyles, transform, boxShadow, border, ...style }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={() => setSelected(!selected)}
    >
      {children}
    </button>
  )
}

function PreviewIOBadge({ value, multiplier }: { value: string; multiplier?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 4,
      background: 'var(--background)',
      border: '1.5px solid var(--c-goal)',
      boxShadow: '2px 2px 0 var(--border)',
      fontSize: 11, fontWeight: 700,
    }}>
      <IconCustom name="io-star" size={11} style={{ fill: 'var(--c-goal)' }} />
      <span style={{ color: 'var(--c-goal)' }}>{value} IO</span>
      {multiplier && (
        <span style={{ color: 'var(--foreground)', opacity: .6 }}>· {multiplier}</span>
      )}
    </span>
  )
}

function PreviewAvatar({ initials }: { initials: string }) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: '50%',
      background: 'var(--c-event)',
      border: '2px solid var(--c-event-b)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700,
      color: 'var(--c-event-t)',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

function PreviewCardCompact({
  title, type = 'default', io, showCheckbox = false, progress,
}: {
  title: string
  type?: 'default' | 'habit' | 'goal' | 'task' | 'event' | 'note'
  io?: string
  showCheckbox?: boolean
  progress?: number
}) {
  const [hovered, setHovered] = useState(false)
  const [checked, setChecked] = useState(false)

  const typeColors: Record<string, { border: string; badge: string; badgeText: string }> = {
    default:  { border: 'var(--border)',       badge: 'var(--c-note-bg)', badgeText: 'var(--c-note-t)' },
    habit:   { border: 'var(--c-habit-b)',  badge: 'var(--c-habit)', badgeText: '#000000' },
    goal:    { border: 'var(--c-goal-b)',   badge: 'var(--c-goal)',  badgeText: '#000000' },
    task:    { border: 'var(--c-task-b)',  badge: 'var(--c-task)',  badgeText: '#000' },
    event:   { border: 'var(--c-event-b)', badge: 'var(--c-event)', badgeText: '#000000' },
    note:    { border: 'var(--border)',    badge: 'var(--c-note-bg)', badgeText: 'var(--c-note-t)' },
  }

  const colors = typeColors[type] || typeColors.default

  return (
    <div style={{
      background: hovered ? 'var(--background)' : 'var(--secondary-background)',
      border: `1.5px solid ${colors.border}`,
      borderRadius: 4,
      padding: '10px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      cursor: 'pointer',
      transition: 'background .12s',
    }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    >
      {showCheckbox && (
        <div 
          onClick={(e) => { e.stopPropagation(); setChecked(!checked) }}
          style={{
            width: 17, height: 17, borderRadius: 3,
            border: `2px solid ${colors.border}`,
            background: checked ? colors.badge : 'var(--secondary-background)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {checked && <Icon name="check-circle" size={10} style={{ color: colors.badgeText }} />}
        </div>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        flex: 1, minWidth: 0,
      }}>
        {(type !== 'goal' || !progress) && (
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 8px', borderRadius: 4,
            fontSize: 10, fontWeight: 700,
            background: colors.badge, color: colors.badgeText,
            border: `1.5px solid ${colors.border}`,
          }}>
            {type}
          </span>
        )}
        {type === 'goal' && progress !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 8px', borderRadius: 4,
              fontSize: 10, fontWeight: 700,
              background: colors.badge, color: colors.badgeText,
              border: `1.5px solid ${colors.border}`,
              flexShrink: 0,
            }}>
              meta
            </span>
            <span style={{
              fontSize: 13, fontWeight: 500, color: 'var(--foreground)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            }}>
              {title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 50, height: 6, background: 'var(--background)', borderRadius: 3, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ height: '100%', background: colors.badge, width: `${progress}%` }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: colors.badge, whiteSpace: 'nowrap' }}>{progress}%</span>
            </div>
          </div>
        )}
        {((type !== 'goal') || !progress) && io && (
          <PreviewIOBadge value={io} />
        )}
        {((type !== 'goal') || !progress) && (
          <span style={{
            fontSize: 13, fontWeight: 500, color: 'var(--foreground)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {title}
          </span>
        )}
      </div>
      <Icon name="caret-right" size={14} style={{ opacity: .4, flexShrink: 0 }} />
    </div>
  )
}

// ─── Seção da library ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '.1em', color: 'var(--foreground)', opacity: .6,
        borderBottom: '1px solid var(--border)', paddingBottom: 8, marginBottom: 16,
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ children, align = 'center' }: { children: React.ReactNode; align?: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: align as any, gap: 12 }}>
      {children}
    </div>
  )
}

// ─── Painel de controle ───────────────────────────────────────────────────────
function ControlPanel({
  tokens, updateToken, reset, exportCSS, isDark, onToggleDark,
}: {
  tokens:       Record<string, string>
  updateToken:  (k: string, v: string) => void
  reset:        () => void
  exportCSS:    string
  isDark:       boolean
  onToggleDark: () => void
}) {
  const [copied, setCopied]     = useState(false)
  const [section, setSection]   = useState<'colors'|'shadow'|'export'>('colors')

  function copy() {
    navigator.clipboard.writeText(exportCSS).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const tabs = [
    { id: 'colors', icon: <Icon name="palette" size={14} />, label: 'Cores'   },
    { id: 'shadow', icon: <Icon name="cube" size={14}    />, label: 'Sombra'  },
    { id: 'export', icon: <Icon name="code" size={14}    />, label: 'Export'  },
  ] as const

  return (
    <aside style={{
      width: 280, flexShrink: 0,
      background: 'var(--secondary-background)',
      border: '2px solid var(--border)',
      boxShadow: 'var(--shadow)',
      display: 'flex', flexDirection: 'column',
      height: '100%', position: 'sticky', top: 0, overflowY: 'auto',
    }}>
      {/* Header do painel */}
      <div style={{
        padding: '14px 16px', borderBottom: '2px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="sliders" size={16} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>Theme Editor</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Dark toggle */}
          <button
            onClick={onToggleDark}
            title={isDark ? 'Mudar para light' : 'Mudar para dark'}
            style={{
              width: 28, height: 28, border: '2px solid var(--border)',
              background: 'var(--background)', color: 'var(--foreground)',
              borderRadius: 4, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isDark ? <Icon name="sun" size={13} /> : <Icon name="moon" size={13} />}
          </button>
          {/* Reset */}
          <button
            onClick={reset}
            title="Resetar para padrão"
            style={{
              width: 28, height: 28, border: '2px solid var(--border)',
              background: 'var(--background)', color: 'var(--foreground)',
              borderRadius: 4, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="arrow-counter-clockwise" size={13} />
          </button>
        </div>
      </div>

      {/* Abas */}
      <div style={{
        display: 'flex', borderBottom: '2px solid var(--border)',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSection(t.id)}
            style={{
              flex: 1, padding: '8px 0', fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '.08em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              background: section === t.id ? 'var(--main)' : 'transparent',
              color: section === t.id ? 'var(--main-foreground)' : 'var(--foreground)',
              border: 'none', cursor: 'pointer',
              borderRight: t.id !== 'export' ? '1px solid var(--border)' : 'none',
              opacity: section !== t.id ? .6 : 1,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── Cores ── */}
        {section === 'colors' && COLOR_TOKENS.map(({ key, label, hint }) => {
          const currentVal = tokens[key] ?? ''
          const hexVal     = oklchToHex(currentVal)

          return (
            <div key={key}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 4,
              }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 10, color: 'var(--foreground)', opacity: .5, marginLeft: 5 }}>
                    {key}
                  </span>
                </div>
                {/* Color swatch + picker */}
                <label style={{ position: 'relative', cursor: 'pointer' }}>
                  <div style={{
                    width: 28, height: 28,
                    background: currentVal.startsWith('#') ? currentVal : hexVal,
                    border: '2px solid var(--border)', borderRadius: 4,
                  }} />
                  <input
                    type="color"
                    value={hexVal}
                    onChange={e => updateToken(key, e.target.value)}
                    style={{
                      position: 'absolute', inset: 0,
                      opacity: 0, width: '100%', height: '100%',
                      cursor: 'pointer',
                    }}
                  />
                </label>
              </div>
              {/* Input de texto para colar oklch/hex manualmente */}
              <input
                value={currentVal}
                onChange={e => updateToken(key, e.target.value)}
                style={{
                  width: '100%', fontSize: 11, padding: '4px 8px',
                  background: 'var(--background)', color: 'var(--foreground)',
                  border: '1px solid var(--border)', borderRadius: 4,
                  fontFamily: 'monospace', outline: 'none',
                }}
              />
              <p style={{ fontSize: 10, color: 'var(--foreground)', opacity: .4, marginTop: 2 }}>
                {hint}
              </p>
            </div>
          )
        })}

        {/* ── Sombra ── */}
        {section === 'shadow' && (
          <>
            <p style={{ fontSize: 11, color: 'var(--foreground)', opacity: .5, lineHeight: 1.5 }}>
              Controla o deslocamento das sombras neobrutalism em todos os botões e cards.
            </p>
            {SHADOW_TOKENS.map(({ key, label, min, max, unit }) => {
              const raw = tokens[key] ?? '4px'
              const num = parseInt(raw) || 0
              return (
                <div key={key}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 5,
                  }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
                    <span style={{
                      fontFamily: 'monospace', fontSize: 12,
                      background: 'var(--background)', padding: '1px 6px',
                      border: '1px solid var(--border)', borderRadius: 3,
                    }}>
                      {raw}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min} max={max} value={num}
                    onChange={e => updateToken(key, `${e.target.value}${unit}`)}
                    style={{ width: '100%', accentColor: 'var(--main)' }}
                  />
                  {/* Atualiza --shadow composto quando X ou Y mudam */}
                </div>
              )
            })}
            {/* Preview da sombra */}
            <div style={{
              padding: 16, background: 'var(--background)',
              border: '1px solid var(--border)', borderRadius: 4, textAlign: 'center',
            }}>
              <p style={{ fontSize: 11, opacity: .5, marginBottom: 12 }}>Preview da sombra</p>
              <PreviewButton isDark={isDark}>Botão de exemplo</PreviewButton>
            </div>
          </>
        )}

        {/* ── Export ── */}
        {section === 'export' && (
          <>
            <p style={{ fontSize: 11, color: 'var(--foreground)', opacity: .5, lineHeight: 1.5 }}>
              Copie o CSS gerado e cole em <code style={{ fontFamily: 'monospace' }}>globals.css</code> para aplicar o tema no projeto.
            </p>
            <pre style={{
              fontSize: 10, lineHeight: 1.7, overflow: 'auto',
              background: 'var(--background)', padding: 10,
              border: '1px solid var(--border)', borderRadius: 4,
              color: 'var(--foreground)', fontFamily: 'monospace',
              maxHeight: 400, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
            }}>
              {exportCSS}
            </pre>
            <button
              onClick={copy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '10px 14px',
                background: 'var(--main)', color: 'var(--main-foreground)',
                border: '2px solid var(--border)', boxShadow: 'var(--shadow)',
                borderRadius: 4, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}
            >
              <span>{copied ? 'Copiado!' : 'Copiar CSS'}</span>
              {copied ? <Icon name="check" size={14} /> : <Icon name="copy" size={14} />}
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ThemeEditorPage() {
  const [isDark, setIsDark] = useState(false)
  const { tokens, updateToken, reset, cssVars, exportCSS } = useThemeTokens(isDark)

  // Sincroniza shadow composta quando X ou Y mudam
  useEffect(() => {
    const x = tokens['--boxShadowX'] ?? '4px'
    const y = tokens['--boxShadowY'] ?? '4px'
    updateToken('--shadow', `${x} ${y} 0px 0px var(--border)`)
  }, [tokens['--boxShadowX'], tokens['--boxShadowY']])

  // Estilo do container de preview — injeta todos os CSS vars
  const previewVars = Object.entries(tokens).reduce((acc, [k, v]) => {
    return { ...acc, [k]: v }
  }, {} as React.CSSProperties)

  return (
    // Container raiz — aplica os tokens via style inline no scope do preview
    <div
      style={{
        // Tokens do tema aplicados como CSS vars neste escopo
        ...previewVars,
        // Layout
        display: 'flex',
        height: '100dvh',
        overflow: 'hidden',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
      } as React.CSSProperties}
    >

      {/* ── PAINEL ESQUERDO — Controles ── */}
      <ControlPanel
        tokens={tokens}
        updateToken={updateToken}
        reset={reset}
        exportCSS={exportCSS}
        isDark={isDark}
        onToggleDark={() => setIsDark(v => !v)}
      />

      {/* ── ÁREA DIREITA — Preview ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* AppBar idêntico ao my-app */}
        <header style={{
          borderBottom: '2px solid var(--border)',
          background: 'var(--background)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'var(--main)', border: '2px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="star" size={14} style={{ color: 'var(--main-foreground)' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>my-app</span>
            <PreviewBadge variant="secondary">v0.1</PreviewBadge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PreviewButton variant="noShadow" size="icon" isDark={isDark}>
              <Icon name="bell" size={16} />
            </PreviewButton>
            <PreviewButton size="sm" isDark={isDark}>
              Get started <Icon name="arrow-right" size={14} />
            </PreviewButton>
          </div>
        </header>

        <main style={{ maxWidth: 672, margin: '0 auto', padding: '24px 16px 80px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Título */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 6 }}>
              Component Library
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: .7, fontSize: 14 }}>
              shadcn/ui · Amber theme · Geist font · Phosphor icons · Tailwind v4
            </p>
          </div>

          {/* Paleta de Tipos */}
          <Section title="Paleta de Tipos">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
              <div style={{ borderRadius: 4, overflow: 'hidden', border: '1.5px solid var(--c-habit-b)' }}>
                <div style={{ height: 40, background: 'var(--c-habit)' }} />
                <div style={{ padding: '6px 8px', background: 'var(--bg2)'  }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-habit-t)' }}>Hábito</div>
                  <div style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'monospace' }}>#F5EFDF</div>
                </div>
              </div>
              <div style={{ borderRadius: 4, overflow: 'hidden', border: '1.5px solid var(--c-goal-b)' }}>
                <div style={{ height: 40, background: 'var(--c-goal)' }} />
                <div style={{ padding: '6px 8px', background: 'var(--bg2)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-goal-t)' }}>Meta</div>
                  <div style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'monospace' }}>#F59E0B</div>
                </div>
              </div>
              <div style={{ borderRadius: 4, overflow: 'hidden', border: '1.5px solid var(--c-task-b)' }}>
                <div style={{ height: 40, background: 'var(--c-task)' }} />
                <div style={{ padding: '6px 8px', background: 'var(--bg2)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-task-t)' }}>Tarefa</div>
                  <div style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'monospace' }}>#6FB8FF</div>
                </div>
              </div>
              <div style={{ borderRadius: 4, overflow: 'hidden', border: '1.5px solid var(--c-event-b)' }}>
                <div style={{ height: 40, background: 'var(--c-event)' }} />
                <div style={{ padding: '6px 8px', background: 'var(--bg2)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-event-t)' }}>Evento</div>
                  <div style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'monospace' }}>#9B7BFF</div>
                </div>
              </div>
              <div style={{ borderRadius: 4, overflow: 'hidden', border: '1.5px solid var(--b2)' }}>
                <div style={{ height: 40, background: 'var(--c-note-bg)' }} />
                <div style={{ padding: '6px 8px', background: 'var(--bg2)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-note-t)' }}>Nota</div>
                  <div style={{ fontSize: 10, color: 'var(--t4)', fontFamily: 'monospace' }}>neutro</div>
                </div>
              </div>
            </div>
          </Section>

          {/* Buttons — variants */}
          <Section title="Buttons — Variants">
            <Row>
              <PreviewButton isDark={isDark}>Default</PreviewButton>
              <PreviewButton variant="noShadow" isDark={isDark}>No Shadow</PreviewButton>
              <PreviewButton variant="neutral" isDark={isDark}>Neutral</PreviewButton>
              <PreviewButton variant="reverse" isDark={isDark}>Reverse</PreviewButton>
              <PreviewButton variant="destructive" isDark={isDark}>Destructive</PreviewButton>
            </Row>
          </Section>

          {/* Buttons — sizes */}
          <Section title="Buttons — Sizes">
            <Row align="flex-end">
              <PreviewButton size="lg" isDark={isDark}><Icon name="house" size={16} /> Large</PreviewButton>
              <PreviewButton isDark={isDark}><Icon name="house" size={16} /> Default</PreviewButton>
              <PreviewButton size="sm" isDark={isDark}><Icon name="house" size={14} /> Small</PreviewButton>
              <PreviewButton size="icon" variant="neutral" isDark={isDark}><Icon name="house" size={16} style={isDark ? { filter: 'invert(1)' } : {}} /></PreviewButton>

              <PreviewButton size="icon" variant="primary" title="configurações" isDark={isDark}>
                <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.6,107.6,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.29,107.29,0,0,0-26.25-10.86,8,8,0,0,0-7.06,1.48L130.16,40Q128,40,125.84,40L107.2,25.08a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.48a8,8,0,0,0-3.93,6L67.32,64.19q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.08,148.8a8,8,0,0,0-1.48,7.06,107.6,107.6,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Z"/>
                </svg>
              </PreviewButton>
              <PreviewButton size="icon" variant="habit" title="nova lista" isDark={isDark}>
                <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
                </svg>
              </PreviewButton>
            </Row>
          </Section>

          {/* Buttons — states */}
          <Section title="Buttons — States">
            <Row>
              <PreviewButton disabled isDark={isDark}>Disabled</PreviewButton>
              <PreviewButton variant="neutral" disabled isDark={isDark}>Disabled neutral</PreviewButton>
              <PreviewButton isDark={isDark}>
                <Icon name="paper-plane" size={15} /> Send message
              </PreviewButton>
            </Row>
          </Section>

          {/* Type buttons */}
          <Section title="Buttons — Type">
            <Row>
              <PreviewButton variant="primary" style={{ color: '#000000' }} isDark={isDark}>
                <Icon name="plus" size={14} /> nova entrada
              </PreviewButton>
              <PreviewButton variant="habit" style={{ color: '#000000' }} isDark={isDark}>
                <IconCustom name="btn-executar" size={14} /> executar
              </PreviewButton>
              <PreviewButton variant="task" style={{ color: '#000000' }} isDark={isDark}>
                <IconCustom name="pill-calendar" size={14} /> agendar
              </PreviewButton>
              <PreviewButton variant="event" style={{ color: '#000000' }} isDark={isDark}>
                <IconCustom name="pill-calendar" size={14} /> evento
              </PreviewButton>
              <PreviewButton variant="ghost" isDark={isDark}>cancelar</PreviewButton>
              <PreviewButton variant="danger" isDark={isDark}>excluir</PreviewButton>
            </Row>
          </Section>

          {/* Action Pills */}
          <Section title="Action Pills">
            <Row>
              <PreviewPill variant="habit" style={{ color: '#000000' }}>
                <IconCustom name="pill-streak" size={12} /> streak
              </PreviewPill>
              <PreviewPill variant="goal" style={{ color: '#000000' }}>
                <IconCustom name="pill-progresso" size={12} /> progresso
              </PreviewPill>
              <PreviewPill variant="task" style={{ color: '#000000' }}>
                <IconCustom name="pill-kanban" size={12} /> kanban
              </PreviewPill>
              <PreviewPill variant="event" style={{ color: '#000000' }}>
                <IconCustom name="pill-calendar" size={12} /> calendário
              </PreviewPill>
              <PreviewPill>
                <IconCustom name="pill-mais" size={12} /> mais
              </PreviewPill>
            </Row>
          </Section>

          {/* IO Badge & Avatar */}
          <Section title="IO Badge & Avatar">
            <Row>
              <PreviewIOBadge value="+17" />
              <PreviewIOBadge value="+42" multiplier="×1.7" />
              <PreviewAvatar initials="GA" />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>Gabriel</p>
                <p style={{ fontSize: 11, color: 'var(--foreground)', opacity: .6 }}>127 IO hoje</p>
              </div>
            </Row>
          </Section>


          {/* Badges */}
          <Section title="Badges">
            <Row>
              <PreviewBadge>Default</PreviewBadge>
              <PreviewBadge variant="secondary">Secondary</PreviewBadge>
              <PreviewBadge variant="outline">Outline</PreviewBadge>
              <PreviewBadge variant="destructive">Destructive</PreviewBadge>
              <PreviewBadge><Icon name="check-circle" size={12} /> Success</PreviewBadge>
              <PreviewBadge variant="outline"><Icon name="info" size={12} /> Info</PreviewBadge>
              <PreviewBadge variant="destructive"><Icon name="warning" size={12} /> Warning</PreviewBadge>
            </Row>
            <div style={{ marginTop: 16 }}><Row>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                borderRadius: 5, fontSize: 12, fontWeight: 500,
                border: '2px solid', background: 'var(--c-habit)', color: 'var(--c-habit-t)',
                borderColor: 'var(--c-habit-b)'
              }}>hábito</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                borderRadius: 5, fontSize: 12, fontWeight: 500,
                border: '2px solid', background: 'var(--c-goal)', color: 'var(--c-goal-t)',
                borderColor: 'var(--c-goal-b)'
              }}>meta</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                borderRadius: 5, fontSize: 12, fontWeight: 500,
                border: '2px solid', background: 'var(--c-task)', color: 'var(--c-task-t)',
                borderColor: 'var(--c-task-b)'
              }}>tarefa</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                borderRadius: 5, fontSize: 12, fontWeight: 500,
                border: '2px solid', background: 'var(--c-event)', color: 'var(--c-event-t)',
                borderColor: 'var(--c-event-b)'
              }}>evento</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                borderRadius: 5, fontSize: 12, fontWeight: 500,
                border: '2px solid', background: 'var(--c-note-bg)', color: 'var(--c-note-t)',
                borderColor: 'var(--b2)'
              }}>nota</span>
            </Row></div>
          </Section>

          {/* Input */}
          <Section title="Input">
            <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
              <PreviewInput placeholder="Default input" />
              <div style={{ position: 'relative' }}>
                
                <PreviewInput placeholder="Buscar..." hasSearchIcon />
              </div>
              <div style={{ position: 'relative' }}>
                <PreviewInput placeholder="500" suffix="R$" />
              </div>
              <PreviewInput placeholder="Disabled input" disabled />
            </div>
          </Section>

          {/* Textarea & Select */}
          <Section title="Textarea & Select">
            <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
              <PreviewTextarea placeholder="Notas..." value="Continue a nadar." />
              <PreviewSelect />
            </div>
          </Section>

          {/* Checkbox, Radio, Toggle */}
          <Section title="Checkbox, Radio & Toggle">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PreviewCheckbox type="habit" />
                <span style={{ fontSize: 13 }}>hábito</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewCheckbox type="goal" />
                <span style={{ fontSize: 13 }}>meta</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewCheckbox type="task" />
                <span style={{ fontSize: 13 }}>tarefa</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewCheckbox type="event" />
                <span style={{ fontSize: 13 }}>evento</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewRadio type="habit" />
                <span style={{ fontSize: 13 }}>hábito</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewRadio type="goal" />
                <span style={{ fontSize: 13 }}>meta</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewRadio type="task" />
                <span style={{ fontSize: 13 }}>tarefa</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewRadio type="event" />
                <span style={{ fontSize: 13 }}>evento</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <PreviewToggle />
                <span style={{ fontSize: 13 }}>toggle</span>
              </div>
            </div>
          </Section>

          {/* Cards */}
          <Section title="Cards">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              <PreviewCard>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Simple Card</p>
                  <p style={{ fontSize: 13, opacity: .6 }}>A basic card with header and content.</p>
                </div>
                <p style={{ fontSize: 13, opacity: .7 }}>
                  Cards are used to group related content and actions.
                </p>
              </PreviewCard>

              <PreviewCard>
                <div>
                  <div style={{
                    width: 40, height: 40, background: 'var(--main)', opacity: .15,
                    borderRadius: 8, marginBottom: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon name="house" size={20} style={{ color: 'black' }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>With Footer</p>
                  <p style={{ fontSize: 13, opacity: .6 }}>A card with an action in the footer.</p>
                </div>
                <p style={{ fontSize: 13, opacity: .7 }}>
                  Perfect for feature highlights or product cards.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <PreviewButton size="sm" isDark={isDark}>Action</PreviewButton>
                  <PreviewButton size="sm" variant="noShadow" isDark={isDark}>Cancel</PreviewButton>
                </div>
              </PreviewCard>

              {/* Error card — borda destrutiva */}
              <div style={{
                background: 'var(--secondary-background)', color: 'var(--foreground)',
                border: '2px solid var(--destructive-pastel)',
                borderRadius: 5, padding: 20,
                display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: 'var(--shadow)',
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Icon name="x-circle" size={18}
                      style={{ color: 'var(--destructive-pastel)' }} />
                    <p style={{ fontWeight: 700, fontSize: 15,
                      color: 'var(--destructive-pastel)' }}>Error State</p>
                  </div>
                  <p style={{ fontSize: 13, opacity: .6 }}>Something went wrong.</p>
                </div>
                <p style={{ fontSize: 13, opacity: .7 }}>
                  Cards can reflect semantic states via border and background colors.
                </p>
                <PreviewButton size="sm" variant="destructive" isDark={isDark}>Retry</PreviewButton>
              </div>
            </div>
          </Section>

          {/* Compact Cards */}
          <Section title="Cards — Compact">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PreviewCardCompact title="Meditei 10 minutos hoje" type="habit" io="+17" showCheckbox />
              <PreviewCardCompact title="Reunião com cliente sexta" type="event" io="+28" showCheckbox />
              <PreviewCardCompact title="Guardar R$500 por mês" type="goal" progress={53} showCheckbox />
              <PreviewCardCompact title="Entregar relatório até quinta" type="task" io="+42" showCheckbox />
              <PreviewCardCompact title="Ideia: Pomodoro de 25min" type="note" showCheckbox />
            </div>
          </Section>

          {/* Expanded Cards */}
          <Section title="Cards — Expanded">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <PreviewCardExpanded
                title="Meditei 10 minutos hoje de manhã"
                type="habit"
                io="+10"
                description="Hábito com frequência detectada. Streak ativo — terceiro dia seguido."
                notes="Precisei de um timer para manter o foco."
                tags={['meditação', 'hoje', '10 min']}
                streak={3}
                isDark={isDark}
              />
              <PreviewCardExpanded
                title="Guardar R$500 por mês"
                type="goal"
                description="Meta detectada. Acompanhamento mensal ativo."
                tags={['finanças']}
                goalMeta={{ current: 'R$ 800', percent: 53, target: 'R$ 1.500' }}
                isDark={isDark}
              />
              <PreviewCardExpanded
                title="Entregar relatório até quinta"
                type="task"
                io="+42"
                description="Tarefa urgente. Prazo em 3 dias — alerta ativo."
                notes="Dados prontos, falta formatar e revisar."
                tags={['trabalho', 'quinta']}
                urgent
                isDark={isDark}
              />
              <PreviewCardExpanded
                title="Reunião com cliente sexta"
                type="event"
                io="+28"
                description="Evento agendado. Lembrete ativo."
                tags={['trabalho', 'quinta']}
                isDark={isDark}
              />
              <PreviewCardExpanded
                title="Ideia: Pomodoro de 25min"
                type="note"
                description="Nota rápida para não esquecer."
                tags={['produtividade']}
                isDark={isDark}
              />
            </div>
          </Section>

          {/* Command Palette */}
          <Section title="Command Palette — ⌘K">
            <PreviewCommandPalette />
          </Section>

          {/* Colors */}
          <Section title="Theme Colors — Neobrutalism">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'main',                 bg: 'var(--main)',                  color: 'var(--main-foreground)' },
                { label: 'secondary-background', bg: 'var(--secondary-background)',  color: 'var(--foreground)' },
                { label: 'destructive',          bg: 'var(--destructive-pastel)',     color: 'var(--destructive-pastel-foreground)' },
                { label: 'background',           bg: 'var(--background)',             color: 'var(--foreground)', border: true },
              ].map(c => (
                <div
                  key={c.label}
                  style={{
                    background: c.bg, color: c.color,
                    padding: '10px 16px', fontSize: 12, fontWeight: 600,
                    borderRadius: 5, minWidth: 96, textAlign: 'center',
                    border: c.border ? '2px solid var(--border)' : '2px solid transparent',
                  }}
                >
                  {c.label}
                </div>
              ))}
            </div>
          </Section>

          {/* Typography */}
          <Section title="Typography — Geist">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1 }}>Display heading</p>
              <p style={{ fontSize: 24, fontWeight: 600 }}>Section heading</p>
              <p style={{ fontSize: 20, fontWeight: 500 }}>Subheading</p>
              <p style={{ fontSize: 15 }}>Body text — the quick brown fox jumps over the lazy dog.</p>
              <p style={{ fontSize: 13, opacity: .7 }}>Muted / caption — supporting detail, metadata, timestamps.</p>
              <p style={{
                fontFamily: 'monospace', fontSize: 13,
                background: 'var(--secondary-background)', padding: '8px 14px',
                borderRadius: 4, border: '1px solid var(--border)',
              }}>
                Monospaced — const greeting = "hello world";
              </p>
            </div>
          </Section>

          {/* Spacing */}
          <Section title="Spacing — 4px Scale">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--t4)',
                    textTransform: 'uppercase', marginBottom: 12
                  }}>
                    escala base 4px
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>4px</span>
                      <div style={{ width: 4, height: 16, background: 'var(--c-habit)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>ícone ↔ texto</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>8px</span>
                      <div style={{ width: 8, height: 16, background: 'var(--c-goal)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>gap interno</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>12px</span>
                      <div style={{ width: 12, height: 16, background: 'var(--c-task)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>padding card</span>
                    </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>16px</span>
                      <div style={{ width: 16, height: 16, background: 'var(--c-event)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>padding seção</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>20px</span>
                      <div style={{ width: 20, height: 16, background: 'var(--b2)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>gap entre cards</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>24px</span>
                      <div style={{ width: 24, height: 16, background: 'var(--b3)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>entre seções</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>32px</span>
                      <div style={{ width: 32, height: 16, background: 'var(--bg3)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>blocos principais</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>40px</span>
                      <div style={{ width: 40, height: 16, background: 'var(--bg4)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>h-10 inputs</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
                      <span style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 32 }}>48px</span>
                      <div style={{ width: 48, height: 16, background: 'var(--main)', borderRadius: 2 }}></div>
                      <span style={{ fontSize: 12, color: 'var(--t2)' }}>topbar / sb-head</span>
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--b2)', margin: '16px 0' }}></div>

                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--t4)',
                    textTransform: 'uppercase', marginBottom: 12
                  }}>
                    margens entre elementos
                  </div>
                  <div style={{
                    background: 'var(--bg3)', border: '1.5px solid var(--b2)', borderRadius: 4, overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '7px 12px', borderBottom: '0.5px solid var(--b)', display: 'flex',
                      justifyContent: 'space-between', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>label → input</span>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>5px</span>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderBottom: '0.5px solid var(--b)', display: 'flex',
                      justifyContent: 'space-between', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>input → hint</span>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>4px</span>
                    </div>
                    <div style={{
                      padding: '12px 12px', borderBottom: '0.5px solid var(--b)', display: 'flex',
                      justifyContent: 'space-between', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>campo → campo</span>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>12px</span>
                    </div>
                    <div style={{
                      padding: '8px 12px', borderBottom: '0.5px solid var(--b)', display: 'flex',
                      justifyContent: 'space-between', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>card → card</span>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>8px</span>
                    </div>
                    <div style={{
                      padding: '24px 12px', borderBottom: '0.5px solid var(--b)', display: 'flex',
                      justifyContent: 'space-between', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>seção → seção</span>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>24px</span>
                    </div>
                    <div style={{
                      padding: '6px 12px', borderBottom: '0.5px solid var(--b)', display: 'flex',
                      justifyContent: 'space-between', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>badge ↔ badge</span>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>6px</span>
                    </div>
                    <div style={{
                      padding: '8px 12px', display: 'flex', justifyContent: 'space-between', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>btn ↔ btn</span>
                      <span style={{ color: 'var(--t4)', fontFamily: 'monospace' }}>8px</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--t4)',
                    textTransform: 'uppercase', marginBottom: 12
                  }}>
                    responsividade
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        height: 16, width: 40, borderLeft: '3px solid var(--c-habit)',
                        background: 'var(--c-habit-bg)', borderRadius: '0 3px 3px 0',
                        display: 'flex', alignItems: 'center', paddingLeft: 6
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-habit-t)' }}>xs</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 72 }}>&lt;480px</span>
                      <span style={{ fontSize: 11, color: 'var(--t2)' }}>1 col · sidebar oculta</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        height: 16, width: 56, borderLeft: '3px solid var(--c-goal)',
                        background: 'var(--c-goal-bg)', borderRadius: '0 3px 3px 0',
                        display: 'flex', alignItems: 'center', paddingLeft: 6
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-goal-t)' }}>sm</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 72 }}>480–767</span>
                      <span style={{ fontSize: 11, color: 'var(--t2)' }}>sidebar bottom sheet</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        height: 16, width: 72, borderLeft: '3px solid var(--c-task)',
                        background: 'var(--c-task-bg)', borderRadius: '0 3px 3px 0',
                        display: 'flex', alignItems: 'center', paddingLeft: 6
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-task-t)' }}>md</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 72 }}>768–1023</span>
                      <span style={{ fontSize: 11, color: 'var(--t2)' }}>sidebar icon-only</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        height: 16, width: 88, borderLeft: '3px solid var(--c-event)',
                        background: 'var(--c-event-bg)', borderRadius: '0 3px 3px 0',
                        display: 'flex', alignItems: 'center', paddingLeft: 6
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--c-event-t)' }}>lg</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 72 }}>1024–1279</span>
                      <span style={{ fontSize: 11, color: 'var(--t2)' }}>sidebar w-220</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        height: 16, width: '100%', maxWidth: 104, borderLeft: '3px solid var(--b3)',
                        background: 'var(--bg4)', borderRadius: '0 3px 3px 0',
                        display: 'flex', alignItems: 'center', paddingLeft: 6
                      }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t2)' }}>xl</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--t3)', minWidth: 72 }}>≥1280</span>
                      <span style={{ fontSize: 11, color: 'var(--t2)' }}>split view</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0,
                    background: 'var(--bg4)', padding: '8px 12px',
                    fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase'
                  }}>
                    <span style={{ color: 'var(--t4)' }}>componente</span>
                    <span style={{ color: 'var(--t4)' }}>xs</span>
                    <span style={{ color: 'var(--t4)' }}>sm</span>
                    <span style={{ color: 'var(--t4)' }}>md</span>
                    <span style={{ color: 'var(--c-goal-t)' }}>lg+</span>
                  </div>
                  <div style={{ border: '1px solid var(--b2)', borderTop: 'none' }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0,
                      padding: '8px 12px', borderBottom: '1px solid var(--b2)', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>sidebar</span>
                      <span style={{ color: 'var(--t4)' }}>oculta</span>
                      <span style={{ color: 'var(--t4)' }}>sheet</span>
                      <span style={{ color: 'var(--t4)' }}>ícone</span>
                      <span style={{ color: 'var(--t1)', fontWeight: 700 }}>w-220</span>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0,
                      padding: '8px 12px', borderBottom: '1px solid var(--b2)', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>topbar</span>
                      <span style={{ color: 'var(--t4)' }}>título</span>
                      <span style={{ color: 'var(--t4)' }}>+ação</span>
                      <span style={{ color: 'var(--t4)' }}>bc</span>
                      <span style={{ color: 'var(--t1)', fontWeight: 700 }}>completa</span>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0,
                      padding: '8px 12px', borderBottom: '1px solid var(--b2)', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>feed</span>
                      <span style={{ color: 'var(--t4)' }}>1 col</span>
                      <span style={{ color: 'var(--t4)' }}>1 col</span>
                      <span style={{ color: 'var(--t4)' }}>2 col</span>
                      <span style={{ color: 'var(--t1)', fontWeight: 700 }}>2 col+</span>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0,
                      padding: '8px 12px', borderBottom: '1px solid var(--b2)', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>edit drawer</span>
                      <span style={{ color: 'var(--t4)' }}>bottom</span>
                      <span style={{ color: 'var(--t4)' }}>bottom</span>
                      <span style={{ color: 'var(--t4)' }}>side</span>
                      <span style={{ color: 'var(--t1)', fontWeight: 700 }}>side 400</span>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 0,
                      padding: '8px 12px', fontSize: 11
                    }}>
                      <span style={{ color: 'var(--t2)' }}>cmd palette</span>
                      <span style={{ color: 'var(--t4)' }}>full</span>
                      <span style={{ color: 'var(--t4)' }}>full</span>
                      <span style={{ color: 'var(--t4)' }}>modal</span>
                      <span style={{ color: 'var(--t1)', fontWeight: 700 }}>modal</span>
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: 'var(--b2)', margin: '16px 0' }}></div>

                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: '.1em', color: 'var(--t4)',
                    textTransform: 'uppercase', marginBottom: 12
                  }}>
                    tailwind.config
                  </div>
                  <div style={{
                    background: 'var(--bg3)', border: '1px solid var(--b2)', borderRadius: 4,
                    padding: '12px 14px', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.5
                  }}>
                    <div>colors.ink    = '#0c0c0c'</div>
                    <div>colors.habit  = '#F5EFDF'</div>
                    <div>colors.goal   = '#F59E0B'</div>
                    <div>colors.task   = '#6FB8FF'</div>
                    <div>colors.event  = '#9B7BFF'</div>
                    <div>shadow.nb     = '4px 4px 0 #0c0c0c'</div>
                    <div>shadow.nb-sm  = '2px 2px 0 #0c0c0c'</div>
                    <div>borderRadius.xs = '4px'</div>
                  </div>
                </div>
              </div>
            </div>
          </Section>

        </main>
      </div>
    </div>
  )
}