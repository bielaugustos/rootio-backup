import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import { geist } from './fonts'
import { ThemeInitializer } from '@/components/ThemeInitializer'

export const metadata: Metadata = {
  title:       'Rootio — Evolução Pessoal com IO',
  description: 'Sistema de produtividade gamificado. Hábitos, finanças, carreira e bem-estar em um só lugar.',
  manifest:    '/manifest.json',
  icons: {
    icon: '/logotipoio.png',
    apple: '/logotipoio.png',
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
  themeColor:       '#f59e0b',
  viewportFit:      'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geist.variable} min-h-screen bg-nb-bg antialiased font-sans`}>
        <ThemeInitializer />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background:   '#1c1917',
              color:        '#f59e0b',
              border:       '2px solid #1c1917',
              borderRadius: '6px',
              fontFamily:   'monospace',
              fontWeight:   '700',
              fontSize:     '12px',
              boxShadow:    '3px 3px 0 #b45309',
            },
          }}
        />
      </body>
    </html>
  )
}
