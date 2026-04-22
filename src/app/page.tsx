'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/utils'
import { LoadingScreen } from '@/components/LoadingScreen'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/dashboard')
      } else {
        const skipped = storage('io_auth_skipped', false)
        router.replace(skipped ? '/dashboard' : '/auth')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-nb-bg">
      <LoadingScreen />
    </div>
  )
}
