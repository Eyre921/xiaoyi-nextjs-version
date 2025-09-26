import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface AdminTableProps {
  headers: string[]
  children: React.ReactNode
  className?: string
}

export function AdminTable({ headers, children, className }: AdminTableProps) {
  return (
    <div className={cn("rounded-lg border border-white/20 overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            {headers.map((header, index) => (
              <TableHead key={index} className="text-white/80 font-medium">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-white/10">
          {children}
        </TableBody>
      </Table>
    </div>
  )
}

export function AdminTableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableRow className={cn("border-white/10 hover:bg-white/5", className)}>
      {children}
    </TableRow>
  )
}

export function AdminTableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <TableCell className={cn("text-white/90", className)}>
      {children}
    </TableCell>
  )
}