'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

export interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const COLOR_MAP = {
  orange: {
    bg: 'bg-orange-500',
    border: 'border-orange-500',
    text: 'text-orange-500',
    line: 'stroke-orange-500',
  },
  violet: {
    bg: 'bg-violet-500',
    border: 'border-violet-500',
    text: 'text-violet-500',
    line: 'stroke-violet-500',
  },
  red: {
    bg: 'bg-red-500',
    border: 'border-red-500',
    text: 'text-red-500',
    line: 'stroke-red-500',
  },
  zinc: {
    bg: 'bg-zinc-500',
    border: 'border-zinc-500',
    text: 'text-zinc-500',
    line: 'stroke-zinc-500',
  },
  petrol: {
    bg: 'bg-teal-500',
    border: 'border-teal-500',
    text: 'text-teal-500',
    line: 'stroke-teal-500',
  },
} as const

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, value, onChange, min = 0, max = 50, step = 5, ...props }, ref) => {
    const checkpoints = React.useMemo(() => {
      const points: number[] = []
      for (let i = min; i <= max; i += step) {
        points.push(i)
      }
      return points
    }, [min, max, step])

    const getColorKey = (val: number): keyof typeof COLOR_MAP => {
      if (val >= 40) return 'petrol'
      if (val >= 30) return 'zinc'
      if (val >= 20) return 'red'
      if (val >= 10) return 'violet'
      return 'orange'
    }

    const currentColor = COLOR_MAP[getColorKey(value)]

    const currentIndex = checkpoints.findIndex(c => c === value)

    const handlePrevious = () => {
      if (currentIndex > 0) {
        onChange(checkpoints[currentIndex - 1])
      }
    }

    const handleNext = () => {
      if (currentIndex < checkpoints.length - 1) {
        onChange(checkpoints[currentIndex + 1])
      }
    }

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {/* Navigation */}
        <div className="flex items-center justify-between gap-[5px]">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
          >
            <CaretLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          {/* Single checkpoint in center */}
          <div className="flex items-center justify-center px-1">
            <button
              type="button"
              onClick={() => onChange(value)}
              className="transition-all"
            >
              {/* Checkpoint pill */}
              <div
                className={cn(
                  'h-12 w-20 rounded-md border-2 flex items-center justify-center transition-all duration-300 bg-background',
                  currentColor.bg,
                  currentColor.border,
                  'text-white'
                )}
              >
                <span className="text-base font-bold">{value}</span>
              </div>
            </button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === checkpoints.length - 1}
            className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
          >
            <CaretRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    )
  }
)
Stepper.displayName = 'Stepper'

export { Stepper }