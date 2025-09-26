import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function AdminSearchBar({
  value,
  onChange,
  placeholder = "搜索...",
  className
}: AdminSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-blue-400/50 focus:ring-blue-400/20"
      />
    </div>
  )
}