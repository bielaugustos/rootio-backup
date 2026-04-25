import { cn } from "@/lib/utils"

interface PropagateLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  color?: string;
}

const PropagateLoader = ({ 
  className, 
  size = 12, // size of individual dots
  color = "bg-primary",
  ...props 
}: PropagateLoaderProps) => {
  // Animation delays create the propagation effect
  const delays = ["-0.4s", "-0.2s", "0s"]; 

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} {...props}>
      {delays.map((delay, index) => (
        <div
          key={index}
          className={cn("rounded-full animate-propagate", color)}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: delay,
          }}
        />
      ))}
    </div>
  );
};

export { PropagateLoader }