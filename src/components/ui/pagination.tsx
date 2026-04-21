'use client'

import * as React from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The total number of pages.
   */
  count?: number
  /**
   * The current page number.
   */
  page?: number
  /**
   * The number of items per page.
   */
  perPage?: number
  /**
   * Whether to show the first/last buttons.
   */
  showFirstLast?: boolean
  /**
   * Callback when the page changes.
   */
  onPageChange?: (page: number) => void
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, count = 1, page = 1, showFirstLast = false, onPageChange, ...props }, ref) => {
    const [ellipsis, setEllipsis] = React.useState(false)

    const renderPages = () => {
      const pages: number[] = []
      for (let i = 1; i <= count; i++) {
        pages.push(i)
      }
      return pages
    }

    const pages = renderPages()

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-1 justify-center', className)}
        {...props}
      >
        {showFirstLast && (
          <PaginationItem>
            <PaginationFirst onClick={() => onPageChange?.(1)} />
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationPrevious
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          />
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              isActive={page === p}
              onClick={() => onPageChange?.(p)}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            disabled={page >= count}
            onClick={() => onPageChange?.(page + 1)}
          />
        </PaginationItem>
        {showFirstLast && (
          <PaginationItem>
            <PaginationLast onClick={() => onPageChange?.(count)} />
          </PaginationItem>
        )}
      </div>
    )
  }
)
Pagination.displayName = 'Pagination'

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('', className)}
    {...props}
  />
))
PaginationItem.displayName = 'PaginationItem'

interface PaginationLinkProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
}

const PaginationLink = React.forwardRef<HTMLButtonElement, PaginationLinkProps>(
  ({ className, isActive, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-amber-500 text-white'
          : 'hover:bg-amber-50 text-muted-foreground',
        className
      )}
      {...props}
    />
  )
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    <CaretLeft className="h-4 w-4" />
  </button>
))
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    <CaretRight className="h-4 w-4" />
  </button>
))
PaginationNext.displayName = 'PaginationNext'

const PaginationFirst = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    <span className="text-xs">«</span>
  </button>
))
PaginationFirst.displayName = 'PaginationFirst'

const PaginationLast = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'flex h-8 w-8 items-center justify-center rounded-md border border-input bg-transparent transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  >
    <span className="text-xs">»</span>
  </button>
))
PaginationLast.displayName = 'PaginationLast'

const PaginationEllipsis = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'flex h-8 w-8 items-center justify-center text-sm font-medium',
      className
    )}
  >
    ...
  </span>
)

export {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
}
