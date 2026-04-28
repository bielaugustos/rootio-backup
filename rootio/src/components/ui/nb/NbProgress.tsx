'use client'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface NbProgressProps extends React.ComponentProps<typeof Progress> {
  variant?: 'sun' | 'ink' | 'neutral'
}

export function NbProgress({ className, variant = 'sun', value, ...props }: NbProgressProps) {
  const variantStyles = {
    sun: '[&>div]:bg-amber-500 [&>div]:bg-opacity-100',
    ink: '[&>div]:bg-black [&>div]:bg-opacity-100',
    neutral: '[&>div]:bg-gray-400 [&>div]:bg-opacity-100',
  }

  return (
    <Progress 
      value={value} 
      className={cn(
        'h-2 bg-gray-200',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}