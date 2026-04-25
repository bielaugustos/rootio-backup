  import * as React from "react"
  import { cva, type VariantProps } from "class-variance-authority"
  import { Slot } from "radix-ui"

  import { cn } from "@/lib/utils"

  const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-[4px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
      variants: {
        variant: {
          default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
          outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
          secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
          ghost: "hover:bg-accent hover:text-accent-foreground",
          destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
          link: "text-primary underline-offset-4 hover:underline",
          io: "bg-amber-500 text-black border-2 border-ink shadow-nb hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
          "io-neutral": "bg-background text-foreground border-2 border-ink shadow-nb hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
        },
        size: {
          default: "h-9 px-4 py-2",
          xs: "h-7 px-2 text-xs",
          sm: "h-8 px-3 text-xs",
          lg: "h-10 px-8",
          icon: "h-9 w-9",
          "icon-xs": "h-7 w-7",
          "icon-sm": "h-8 w-8",
          "icon-lg": "h-10 w-10",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  )

  function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
  }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean
    }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
  }

  export { Button, buttonVariants }
