'use client'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    position="bottom-center"
    theme="light"
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:       'group toast group-[.toaster]:bg-background group-[.toaster]:text-white group-[.toaster]:border-border group-[.toaster]:shadow-[4px]',
        description: 'group-[.toast]:text-muted text-xs',
        actionButton:'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton:'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
      style: {
        background:   '#1e1e1e',
        color:        '#white',
        border:       '2px solid #black',
        borderRadius: '4px',
        fontFamily:   'var(--font-geist), sans-serif',
        fontWeight:   '500',
        fontSize:     '12px',
        padding:    '10px 12px',
        minWidth:  '200px',
      }
    }}
    {...props} />
)

export { Toaster }