'use client'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

// ─── Tipos ──────────────────────────────────────────────────
interface Line {
  id:     number
  x1:     number
  y1:     number
  x2:     number
  y2:     number
  delay:  number
  dur:    number
  opacity:number
}

interface SplashScreenProps {
  onFinish?: () => void
  duration?: number   // ms — total antes de sair (padrão 2800)
}

// ─── Componente ─────────────────────────────────────────────
export function SplashScreen({ onFinish, duration = 2800 }: SplashScreenProps) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter')
  const [lines, setLines]   = useState<Line[]>([])
  const rafRef = useRef<number>()
  const startRef = useRef<number>(0)

  // Gerar linhas aleatórias uma vez
  useEffect(() => {
    const generated: Line[] = Array.from({ length: 28 }, (_, i) => {
      const isHorizontal = Math.random() > 0.4
      const pos = Math.random() * 260
      return isHorizontal
        ? { id: i, x1: -20, y1: pos, x2: 300, y2: pos + (Math.random() - 0.5) * 30,
            delay: Math.random() * 900, dur: 600 + Math.random() * 800,
            opacity: 0.12 + Math.random() * 0.55 }
        : { id: i, x1: pos, y1: -20, x2: pos + (Math.random() - 0.5) * 30, y2: 280,
            delay: Math.random() * 900, dur: 600 + Math.random() * 800,
            opacity: 0.12 + Math.random() * 0.55 }
    })
    setLines(generated)
  }, [])

  // Sequência de fases
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('exit'), duration - 500)
    const t3 = setTimeout(() => onFinish?.(), duration)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [duration, onFinish])

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-background',
        'transition-opacity duration-500',
        phase === 'exit' ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Card centralizado — estilo shadcn */}
      <div
        className={cn(
          'relative w-[220px] h-[220px] rounded-2xl overflow-hidden',
          'border border-border bg-card',
          // Shadow estilo shadcn — 4 camadas
          'shadow-[0_0_0_1px_rgba(0,0,0,.04),0_2px_4px_rgba(0,0,0,.04),0_8px_16px_rgba(0,0,0,.06),0_24px_48px_rgba(0,0,0,.08)]',
          'transition-all duration-500',
          phase === 'enter' ? 'scale-90 opacity-0' : 'scale-100 opacity-100',
        )}
      >
        {/* SVG das linhas animadas */}
        <svg
          viewBox="0 0 260 260"
          width="220"
          height="220"
          className="absolute inset-0"
          style={{ background: 'transparent' }}
        >
          <defs>
            {/* Gradiente das linhas */}
            <linearGradient id="lg-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="40%"  stopColor="#f59e0b" stopOpacity="1" />
              <stop offset="60%"  stopColor="#d97706" stopOpacity="1" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lg-neutral" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="currentColor" stopOpacity="0" />
              <stop offset="50%"  stopColor="currentColor" stopOpacity="1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            {/* Clip interno */}
            <clipPath id="clip-inner">
              <rect x="0" y="0" width="260" height="260" />
            </clipPath>
          </defs>

          <g clipPath="url(#clip-inner)">
            {/* Linhas de fundo — neutras */}
            {lines.slice(0, 20).map(l => (
              <line
                key={l.id}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke="currentColor"
                strokeOpacity={l.opacity * 0.35}
                strokeWidth="0.5"
              >
                <animate
                  attributeName="stroke-opacity"
                  values={`0;${l.opacity * 0.35};0`}
                  dur={`${l.dur}ms`}
                  begin={`${l.delay}ms`}
                  repeatCount="indefinite"
                />
              </line>
            ))}

            {/* Linhas amber — destaque */}
            {lines.slice(20).map(l => (
              <line
                key={`a-${l.id}`}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke="#f59e0b"
                strokeOpacity="0"
                strokeWidth="0.8"
              >
                <animate
                  attributeName="stroke-opacity"
                  values={`0;${l.opacity * 0.7};0`}
                  dur={`${l.dur * 1.4}ms`}
                  begin={`${l.delay + 200}ms`}
                  repeatCount="indefinite"
                />
              </line>
            ))}

            {/* Linha varredura horizontal — efeito scanning */}
            <line x1="-20" y1="130" x2="280" y2="130"
              stroke="#f59e0b" strokeOpacity="0" strokeWidth="1.5">
              <animate attributeName="y1" values="20;240;20" dur="3.2s" repeatCount="indefinite" />
              <animate attributeName="y2" values="20;240;20" dur="3.2s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0;0.6;0" dur="3.2s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>

        {/* Logo centralizado sobre as linhas */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {/* Ícone */}
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center',
              'shadow-[0_2px_8px_rgba(245,158,11,0.4)]',
              'transition-all duration-700',
              phase === 'enter' ? 'scale-0 opacity-0' : 'scale-100 opacity-100',
            )}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                fill="white" />
            </svg>
          </div>

          {/* Wordmark */}
          <div
            className={cn(
              'transition-all duration-700 delay-150',
              phase === 'enter' ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0',
            )}
          >
            <span className="font-mono font-semibold text-base tracking-tight text-foreground">
              Root<strong>io</strong>
            </span>
          </div>

          {/* Dots de loading */}
          <div
            className={cn(
              'flex gap-1 mt-1 transition-all duration-500 delay-300',
              phase === 'enter' ? 'opacity-0' : 'opacity-100',
            )}
          >
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1 h-1 rounded-full bg-amber-500"
                style={{
                  animation: `splash-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS da animação dos dots */}
      <style>{`
        @keyframes splash-dot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40%            { opacity: 1;    transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// ─── Hook de controle ────────────────────────────────────────
// Use em qualquer layout ou page que precise da splash
export function useSplash(duration = 2800) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), duration + 200)
    return () => clearTimeout(t)
  }, [duration])
  return visible
}
