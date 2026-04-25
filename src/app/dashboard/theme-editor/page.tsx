'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  House, Bell, Star, Trash, MagnifyingGlass, PaperPlaneTilt,
  ArrowRight, CheckCircle, Warning, Info, XCircle, Sun, Moon,
  Sliders, Eye, Code, Copy, Check, ArrowCounterClockwise,
  Palette, TextAa, Cube, CaretDown, CaretUp,
} from '@phosphor-icons/react'

// ─── Tokens padrão (espelho do globals.css do my-app) ────────────────────────
const DEFAULT_LIGHT = {
  '--background':             'oklch(96.896% 0.01327 97.5)',
  '--secondary-background':   'oklch(100% 0 0)',
  '--foreground':             'oklch(0% 0 0)',
  '--main-foreground':        'oklch(0% 0 0)',
  '--main':                   'oklch(84.08% 0.1725 84.2)',
  '--border':                 'oklch(0% 0 0)',
  '--shadow':                 '4px 4px 0px 0px var(--border)',
  '--boxShadowX':             '4px',
  '--boxShadowY':             '4px',
  '--reverseBoxShadowX':      '-4px',
  '--reverseBoxShadowY':      '-4px',
  '--destructive-pastel':     '#ef593b',
  '--destructive-pastel-foreground': 'oklch(0% 0 0)',
}

const DEFAULT_DARK = {
  '--background':             'oklch(14.958% 0.00002 271.152)',
  '--secondary-background':   'oklch(23.93% 0 0)',
  '--foreground':             'oklch(92.49% 0 0)',
  '--main-foreground':        'oklch(0% 0 0)',
  '--main':                   'oklch(77.7% 0.1594 84.38)',
  '--border':                 'oklch(100% 0 0)',
  '--shadow':                 '4px 4px 0px 0px var(--border)',
  '--boxShadowX':             '4px',
  '--boxShadowY':             '4px',
  '--reverseBoxShadowX':      '-4px',
  '--reverseBoxShadowY':      '-4px',
  '--destructive-pastel':     '#ef593b',
  '--destructive-pastel-foreground': 'oklch(0% 0 0)',
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

  const updateToken = useCallback((key: string, value: string) => {
    setTokens(prev => ({ ...prev, [key]: value }))
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
  children, variant = 'default', size = 'default', disabled = false,
}: {
  children: React.ReactNode
  variant?: 'default' | 'noShadow' | 'neutral' | 'reverse' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
}) {
  const [pressed, setPressed] = useState(false)
  const [hovered, setHovered] = useState(false)

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontWeight: 500, fontSize: 14,
    border: '2px solid var(--border)',
    borderRadius: 'var(--radius-base, 5px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? .5 : 1,
    transition: 'transform .1s, box-shadow .1s',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
    padding: size === 'lg' ? '0 32px' : size === 'sm' ? '0 12px' : '0 16px',
    height: size === 'lg' ? 44 : size === 'sm' ? 36 : 40,
    width: size === 'icon' ? 40 : undefined,
  }

  const variants: Record<string, React.CSSProperties> = {
    default:     { background: 'var(--main)',     color: 'var(--main-foreground)' },
    noShadow:    { background: 'var(--main)',     color: 'var(--main-foreground)' },
    neutral:     { background: 'var(--secondary-background)', color: 'var(--foreground)' },
    reverse:     { background: 'var(--main)',     color: 'var(--main-foreground)' },
    destructive: { background: 'var(--destructive-pastel)', color: 'var(--destructive-pastel-foreground)' },
  }

  const shadowX = 'var(--boxShadowX, 4px)'
  const shadowY = 'var(--boxShadowY, 4px)'
  const revX    = 'var(--reverseBoxShadowX, -4px)'
  const revY    = 'var(--reverseBoxShadowY, -4px)'

  let transform: string | undefined
  let boxShadow: string | undefined

  if (!disabled) {
    if (variant === 'default' || variant === 'neutral' || variant === 'destructive') {
      boxShadow = (hovered || pressed) ? 'none' : `var(--shadow)`
      transform = (hovered || pressed) ? `translate(${shadowX}, ${shadowY})` : 'none'
    } else if (variant === 'reverse') {
      boxShadow = (hovered || pressed) ? `var(--shadow)` : 'none'
      transform = (hovered || pressed) ? `translate(${revX}, ${revY})` : 'none'
    } else {
      boxShadow = 'none'
    }
  }

  return (
    <button
      disabled={disabled}
      style={{ ...base, ...variants[variant], boxShadow, transform }}
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

function PreviewInput({ placeholder, disabled = false }: { placeholder?: string; disabled?: boolean }) {
  return (
    <input
      placeholder={placeholder}
      disabled={disabled}
      style={{
        height: 40, width: '100%', padding: '0 12px', fontSize: 14,
        background: 'var(--secondary-background)', color: 'var(--foreground)',
        border: '2px solid var(--border)', borderRadius: 5,
        fontFamily: 'inherit', fontWeight: 500,
        opacity: disabled ? .5 : 1, cursor: disabled ? 'not-allowed' : 'text',
        outline: 'none',
      }}
    />
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
    { id: 'colors', icon: <Palette size={14} />, label: 'Cores'   },
    { id: 'shadow', icon: <Cube size={14}    />, label: 'Sombra'  },
    { id: 'export', icon: <Code size={14}    />, label: 'Export'  },
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
          <Sliders size={16} weight="bold" />
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
            {isDark ? <Sun size={13} weight="bold" /> : <Moon size={13} weight="bold" />}
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
            <ArrowCounterClockwise size={13} weight="bold" />
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
              <PreviewButton>Botão de exemplo</PreviewButton>
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
              {copied ? <Check size={14} weight="bold" /> : <Copy size={14} weight="bold" />}
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
              <Star weight="fill" size={14} style={{ color: 'var(--main-foreground)' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 14 }}>my-app</span>
            <PreviewBadge variant="secondary">v0.1</PreviewBadge>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PreviewButton variant="noShadow" size="icon">
              <Bell size={16} weight="bold" />
            </PreviewButton>
            <PreviewButton size="sm">
              Get started <ArrowRight size={14} />
            </PreviewButton>
          </div>
        </header>

        <main style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

          {/* Título */}
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-.02em', marginBottom: 6 }}>
              Component Library
            </h1>
            <p style={{ color: 'var(--foreground)', opacity: .7, fontSize: 14 }}>
              shadcn/ui · Amber theme · Geist font · Phosphor icons · Tailwind v4
            </p>
          </div>

          {/* Buttons — variants */}
          <Section title="Buttons — Variants">
            <Row>
              <PreviewButton>Default</PreviewButton>
              <PreviewButton variant="noShadow">No Shadow</PreviewButton>
              <PreviewButton variant="neutral">Neutral</PreviewButton>
              <PreviewButton variant="reverse">Reverse</PreviewButton>
              <PreviewButton variant="destructive">Destructive</PreviewButton>
            </Row>
          </Section>

          {/* Buttons — sizes */}
          <Section title="Buttons — Sizes">
            <Row align="flex-end">
              <PreviewButton size="lg"><House weight="bold" size={16} /> Large</PreviewButton>
              <PreviewButton><House weight="bold" size={16} /> Default</PreviewButton>
              <PreviewButton size="sm"><House weight="bold" size={14} /> Small</PreviewButton>
              <PreviewButton size="icon" variant="neutral"><Bell weight="bold" size={16} /></PreviewButton>
              <PreviewButton size="icon" variant="noShadow"><Trash weight="bold" size={16} /></PreviewButton>
            </Row>
          </Section>

          {/* Buttons — states */}
          <Section title="Buttons — States">
            <Row>
              <PreviewButton disabled>Disabled</PreviewButton>
              <PreviewButton variant="neutral" disabled>Disabled neutral</PreviewButton>
              <PreviewButton>
                <PaperPlaneTilt weight="fill" size={15} /> Send message
              </PreviewButton>
            </Row>
          </Section>

          {/* Badges */}
          <Section title="Badges">
            <Row>
              <PreviewBadge>Default</PreviewBadge>
              <PreviewBadge variant="secondary">Secondary</PreviewBadge>
              <PreviewBadge variant="outline">Outline</PreviewBadge>
              <PreviewBadge variant="destructive">Destructive</PreviewBadge>
              <PreviewBadge><CheckCircle weight="fill" size={12} /> Success</PreviewBadge>
              <PreviewBadge variant="outline"><Info weight="fill" size={12} /> Info</PreviewBadge>
              <PreviewBadge variant="destructive"><Warning weight="fill" size={12} /> Warning</PreviewBadge>
            </Row>
          </Section>

          {/* Input */}
          <Section title="Input">
            <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
              <PreviewInput placeholder="Default input" />
              <div style={{ position: 'relative' }}>
                <MagnifyingGlass
                  size={15}
                  style={{
                    position: 'absolute', left: 10,
                    top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--foreground)', opacity: .6,
                    pointerEvents: 'none',
                  }}
                />
                <PreviewInput placeholder="Search..." />
              </div>
              <PreviewInput placeholder="Disabled input" disabled />
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
                  }} />
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>With Footer</p>
                  <p style={{ fontSize: 13, opacity: .6 }}>A card with an action in the footer.</p>
                </div>
                <p style={{ fontSize: 13, opacity: .7 }}>
                  Perfect for feature highlights or product cards.
                </p>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <PreviewButton size="sm">Action</PreviewButton>
                  <PreviewButton size="sm" variant="noShadow">Cancel</PreviewButton>
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
                    <XCircle weight="fill" size={18}
                      style={{ color: 'var(--destructive-pastel)' }} />
                    <p style={{ fontWeight: 700, fontSize: 15,
                      color: 'var(--destructive-pastel)' }}>Error State</p>
                  </div>
                  <p style={{ fontSize: 13, opacity: .6 }}>Something went wrong.</p>
                </div>
                <p style={{ fontSize: 13, opacity: .7 }}>
                  Cards can reflect semantic states via border and background colors.
                </p>
                <PreviewButton size="sm" variant="destructive">Retry</PreviewButton>
              </div>
            </div>
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

        </main>
      </div>
    </div>
  )
}