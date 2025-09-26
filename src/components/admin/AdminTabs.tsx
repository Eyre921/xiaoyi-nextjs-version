import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface AdminTabsProps {
  defaultValue: string
  children: React.ReactNode
  className?: string
}

export function AdminTabs({ defaultValue, children, className }: AdminTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      {children}
    </Tabs>
  )
}

interface AdminTabsListProps {
  children: React.ReactNode
  className?: string
}

export function AdminTabsList({ children, className }: AdminTabsListProps) {
  return (
    <TabsList className={cn(
      "bg-white/10 border border-white/20 p-1 rounded-xl",
      className
    )}>
      {children}
    </TabsList>
  )
}

interface AdminTabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function AdminTabsTrigger({ value, children, className }: AdminTabsTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/20 rounded-lg px-6 py-2 transition-all",
        className
      )}
    >
      {children}
    </TabsTrigger>
  )
}

interface AdminTabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function AdminTabsContent({ value, children, className }: AdminTabsContentProps) {
  return (
    <TabsContent value={value} className={cn("mt-6", className)}>
      {children}
    </TabsContent>
  )
}