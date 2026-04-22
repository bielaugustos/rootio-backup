'use client'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'
import { Bell, Lightning } from '@phosphor-icons/react'
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { economy, avatar, bgColor, bgImage } = useAppStore()

  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-sm font-semibold">
                IO Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4">
            <Link href="/dashboard/progress">
              <div className="io-ticker"><Lightning size={8} weight="fill" />{economy.saldo_io} IO</div>
            </Link>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={16} />
            </Button>
            <Link href="/dashboard/profile">
              <div 
                className="w-8 h-8 rounded-full border-2 border-amber-200 hover:border-amber-400 transition-colors cursor-pointer relative overflow-hidden"
                style={{ backgroundColor: !bgImage ? bgColor : 'transparent' }}
              >
                {bgImage && (
                  <img src={bgImage} alt="avatar" className="absolute inset-0 w-full h-full object-cover" />
                )}
                <span 
                  className="absolute inset-0 flex items-center justify-center text-sm" 
                  style={{ color: bgColor === '#ffffff' || bgColor === '#fef3c7' ? '#000' : '#fff' }}
                >
                  {avatar}
                </span>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
