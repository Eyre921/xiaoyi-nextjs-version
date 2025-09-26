import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AdminButton } from "./AdminButton"
import { cn } from "@/lib/utils"

interface AdminModalProps {
  title: string
  trigger?: React.ReactNode
  children: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  className?: string
}

export function AdminModal({
  title,
  trigger,
  children,
  open,
  onOpenChange,
  className
}: AdminModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className={cn(
        "bg-black/90 backdrop-blur-xl border-white/20 text-white max-w-2xl",
        className
      )}>
        <DialogHeader>
          <DialogTitle className="text-white text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface AdminModalActionsProps {
  onCancel?: () => void
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  confirmVariant?: "primary" | "success" | "warning" | "danger"
  isLoading?: boolean
}

export function AdminModalActions({
  onCancel,
  onConfirm,
  confirmText = "确认",
  cancelText = "取消",
  confirmVariant = "primary",
  isLoading = false
}: AdminModalActionsProps) {
  return (
    <div className="flex justify-end gap-3 mt-6">
      {onCancel && (
        <AdminButton
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          {cancelText}
        </AdminButton>
      )}
      {onConfirm && (
        <AdminButton
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "处理中..." : confirmText}
        </AdminButton>
      )}
    </div>
  )
}