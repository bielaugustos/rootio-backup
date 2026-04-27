import type { Metadata, Viewport } from 'next'
import './globals.css'
import { geist, spaceGrotesk } from './fonts'
import { ThemeInitializer } from '@/components/ThemeInitializer'
import { cn } from "@/lib/utils"
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title:       'Rootio • Evolução Pessoal com IO',
  description: 'Sistema de produtividade gamificado. Hábitos, finanças, carreira e bem-estar em um só lugar.',
  manifest:    '/manifest.json',
  icons: {
    icon: '/logod.svg',
    apple: '/logod.svg',
  },
  openGraph: {
    title:       'Rootio',
    description: 'Evolução pessoal com o Sistema IO',
    type:        'website',
  },
}

export const viewport: Viewport = {
  width:            'device-width',
  initialScale:     1,
  maximumScale:     1,
  themeColor:       '#f59e0b',
  viewportFit:      'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
   return (
     <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", geist.variable, spaceGrotesk.variable)}>
       <body className={`${geist.variable} min-h-screen bg-nb-bg antialiased font-sans`} suppressHydrationWarning>

<ThemeInitializer />
          <ServiceWorkerRegistration />
          {children}
         <Toaster />
       </body>
     </html>
   )
}