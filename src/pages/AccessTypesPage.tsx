import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from '@tanstack/react-router'
import type { AccessType } from '@/api/types'
import { EntityTable } from '@/components/EntityTable'
import { EntityDrawer } from '@/components/EntityDrawer'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useAccessTypesQuery,
  useCreateAccessType,
  useUpdateAccessType,
  useDeleteAccessType,
} from '@/hooks/useAccessTypes'

const PAGE_SIZE = 20

const accessTypeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bit: z.string().min(1, 'Bit value is required'),
})
type AccessTypeForm = z.infer<typeof accessTypeSchema>

export default function AccessTypesPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/access-types' })
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingAccessType, setEditingAccessType] = useState<AccessType | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AccessType | null>(null)

  const { data, isLoading, isError } = useAccessTypesQuery(domainId, {
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
  })

  const createMutation = useCreateAccessType(domainId)
  const updateMutation = useUpdateAccessType(domainId)
  const deleteMutation = useDeleteAccessType(domainId)

  const columns: ColumnDef<AccessType>[] = [
    { accessorKey: 'Title', header: 'Title', enableSorting: true },
    {
      accessorKey: 'Bit',
      header: 'Bit',
      enableSorting: true,
      cell: ({ getValue }) => {
        const v = getValue() as number
        return <span className="font-mono text-sm">{v} (0x{v.toString(16)})</span>
      },
    },
    {
      accessorKey: 'ID',
      header: 'ID',
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground font-mono">{getValue() as string}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteTarget(row.original)
            }}
            aria-label="Delete access type"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Access Types</h1>
        <Button
          onClick={() => {
            setEditingAccessType(null)
            createMutation.reset()
            setDrawerOpen(true)
          }}
        >
          + New Access Type
        </Button>
      </div>

      <EntityTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load access types."
        total={data?.meta.total ?? 0}
        offset={offset}
        onOffsetChange={setOffset}
        pageSize={PAGE_SIZE}
        onRowDoubleClick={(at) => {
          updateMutation.reset()
          setEditingAccessType(at)
          setDrawerOpen(true)
        }}
        onSortChange={(s, o) => {
          setSort(s)
          setOrder(o)
        }}
        searchPlaceholder="Filter this page…"
      />

      <EntityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingAccessType ? 'Edit Access Type' : 'New Access Type'}
      >
        <AccessTypeFormFields
          key={editingAccessType?.ID ?? 'new'}
          defaultValues={{
            title: editingAccessType?.Title ?? '',
            bit: editingAccessType?.Bit?.toString() ?? '',
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          onSubmit={({ title, bit }) => {
            if (editingAccessType) {
              updateMutation.mutate(
                { id: editingAccessType.ID, data: { title, bit } },
                { onSuccess: () => setDrawerOpen(false) },
              )
            } else {
              createMutation.mutate({ title, bit }, { onSuccess: () => setDrawerOpen(false) })
            }
          }}
          onCancel={() => setDrawerOpen(false)}
        />
      </EntityDrawer>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.Title ?? ''}
        isPending={deleteMutation.isPending}
        error={deleteMutation.error?.message}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.ID, { onSuccess: () => setDeleteTarget(null) })
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function AccessTypeFormFields({
  defaultValues,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: {
  defaultValues: { title: string; bit: string }
  isSubmitting: boolean
  error?: string
  onSubmit: (data: { title: string; bit: string }) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessTypeForm>({
    resolver: zodResolver(accessTypeSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="at-title">Title</Label>
        <Input id="at-title" autoFocus {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="at-bit">Bit Value (decimal or 0x hex)</Label>
        <Input id="at-bit" placeholder="e.g. 1 or 0x01" {...register('bit')} />
        {errors.bit && <p className="text-xs text-destructive">{errors.bit.message}</p>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
