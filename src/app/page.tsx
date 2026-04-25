'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { storage } from '@/lib/utils'
import { PropagateLoader } from '@/components/ui/propagate-loader'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar após breve delay
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        router.replace('/dashboard')
      } else {
        const skipped = storage('io_auth_skipped', false)
        router.replace(skipped ? '/dashboard' : '/auth')
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-nb-bg">
      <PropagateLoader size={8} color="bg-black" />
    </div>
  )
}