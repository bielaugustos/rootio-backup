import localFont from 'next/font/local'

const geist = localFont({
  src: [
    {
      path: '../../public/fonts/Geist/Geist-VariableFont_wght.ttf',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-geist',
  display: 'swap',
})

const spaceGrotesk = localFont({
  src: [
    {
      path: '../../public/fonts/space-grotesk-latin-wght-normal.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export { geist, spaceGrotesk }