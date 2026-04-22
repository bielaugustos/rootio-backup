'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function PageSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      {/* Header skeleton */}
      <div className="p-3 pb-0 space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Hero card skeleton */}
      <Card className="mx-3 mt-3">
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Cards extras skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="mx-3 mt-3">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}