'use client'
import { Check } from '@phosphor-icons/react'

interface NbCheckProps {
  checked: boolean
  size?: number
  className?: string
}

export function NbCheck({ checked, size = 16, className }: NbCheckProps) {
  return (
    <span className={className}>
      {checked ? (
        <Check size={size} weight="bold" />
      ) : (
        <span 
          className="inline-block w-[1px] h-[1px]" 
          style={{ width: size, height: size }}
        />
      )}
    </span>
  )
}