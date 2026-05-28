import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface EntityDrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function EntityDrawer({ open, onClose, title, children }: EntityDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
