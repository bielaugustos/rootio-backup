import { cn } from "@/lib/utils"

function Loader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-spin !rounded-full border-4 border-black border-t-transparent spinner-circle", className)}
      {...props}
    />
  )
}

export { Loader as Spinner }