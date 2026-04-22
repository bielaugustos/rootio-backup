'use client'

import { useEffect, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  minDuration?: number // ms - tempo mínimo de exibição (padrão: 800)
}

export function LoadingScreen({ minDuration = 800 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    // Tempo mínimo antes de começar a desaparecer
    const timer = setTimeout(() => {
      setFading(true)
      
      // Tempo da animação de fade-out
      setTimeout(() => {
        setVisible(false)
      }, 500)
    }, minDuration)

    return () => clearTimeout(timer)
  }, [minDuration])

  if (!visible) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center bg-background',
        'transition-opacity duration-500',
        fading ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <Spinner />
        
        {/* Logo/Texto */}
        <div className={cn(
          'text-lg font-bold tracking-tight',
          'transition-opacity duration-500',
          fading ? 'opacity-0' : 'opacity-100'
        )}>
          <strong className="text-primary-500">Rootio/</strong>
        </div>
      </div>
    </div>
  )
}