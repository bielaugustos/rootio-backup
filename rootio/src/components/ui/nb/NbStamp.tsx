'use client'
import { cn } from '@/lib/utils'

interface NbStampProps {
  children: React.ReactNode
  variant?: 'sun' | 'ink' | 'neutral'
  rotate?: number
  className?: string
}

export function NbStamp({ children, variant = 'sun', rotate = 0, className }: NbStampProps) {
  const variantStyles = {
    sun: 'bg-amber-400 border-amber-500',
    ink: 'bg-black border-black text-white',
    neutral: 'bg-white border-gray-300',
  }

  return (
    <div
      className={cn(
        'inline-block px-4 py-2 border-[3px] font-bold uppercase tracking-wider ',
        variantStyles[variant],
        className
      )}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  )
}