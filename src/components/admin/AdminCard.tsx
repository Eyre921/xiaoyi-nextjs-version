import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AdminCardProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function AdminCard({ title, children, className }: AdminCardProps) {
  return (
    <Card className={cn(
      "bg-white/10 backdrop-blur-xl border-white/20 shadow-xl",
      className
    )}>
      {title && (
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  )
}