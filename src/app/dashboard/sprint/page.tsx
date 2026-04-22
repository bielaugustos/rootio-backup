'use client'
import { Suspense } from 'react'
import SprintDashboard from '@/components/sprint/SprintDashboard'
import { PageSkeleton } from '@/components/PageSkeleton'

export default function SprintPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SprintDashboard />
    </Suspense>
  )
}
