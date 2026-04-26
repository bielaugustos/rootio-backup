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
          const onboardingDone = localStorage.getItem('io_onboarding_done')
          
          if (skipped) {
            // Se pulou autenticação, verificar se já fez onboarding
            if (onboardingDone === 'true') {
              router.replace('/dashboard')
            } else {
              router.replace('/onboarding')
            }
          } else {
            router.replace('/auth')
          }
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