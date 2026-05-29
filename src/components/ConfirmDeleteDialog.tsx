import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface ConfirmDeleteDialogProps {
  open: boolean
  entityName: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
  /** Error message from a failed delete mutation. Displayed inside the dialog. */
  error?: string
}

export function ConfirmDeleteDialog({
  open,
  entityName,
  onConfirm,
  onCancel,
  isPending = false,
  error,
}: ConfirmDeleteDialogProps) {
  return (
    // Only close via onOpenChange when the mutation is not in-flight.
    // This prevents the dialog from closing before the delete resolves,
    // ensuring errors can be shown and the user can retry or cancel.
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && !isPending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{entityName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The record will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-destructive px-1">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(buttonVariants({ variant: 'destructive' }))}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
