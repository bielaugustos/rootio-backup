'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NbButtonProps extends Omit<React.ComponentProps<typeof Button>, 'variant'> {
  variant?: 'sun' | 'ink' | 'neutral'
  block?: boolean
}

export function NbButton({ children, variant = 'ink', block = false, className, ...props }: NbButtonProps) {
  const variantMap = {
    sun: 'io',
    ink: 'io',
    neutral: 'io-neutral',
  } as const

  return (
    <Button
      variant={variantMap[variant]}
      className={cn(
        'uppercase font-bold tracking-wider',
        block && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}