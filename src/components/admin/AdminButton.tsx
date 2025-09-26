import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const adminButtonVariants = cva(
  "transition-all duration-200 font-medium",
  {
    variants: {
      variant: {
        primary: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30",
        success: "bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30",
        warning: "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30",
        danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
        secondary: "bg-white/10 hover:bg-white/20 text-white/80 border border-white/20",
      },
      size: {
        sm: "px-3 py-1.5 text-sm rounded-lg",
        md: "px-4 py-2 text-sm rounded-lg",
        lg: "px-6 py-3 text-base rounded-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adminButtonVariants> {
  children: React.ReactNode
}

export function AdminButton({
  className,
  variant,
  size,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <Button
      className={cn(adminButtonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Button>
  )
}