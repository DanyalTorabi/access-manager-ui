import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from '@tanstack/react-router'
import type { Resource } from '@/api/types'
import { EntityTable } from '@/components/EntityTable'
import { EntityDrawer } from '@/components/EntityDrawer'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useResourcesQuery,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from '@/hooks/useResources'

const PAGE_SIZE = 20

const resourceSchema = z.object({ title: z.string().min(1, 'Title is required') })
type ResourceForm = z.infer<typeof resourceSchema>

export default function ResourcesPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/resources' })
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  const { data, isLoading, isError } = useResourcesQuery(domainId, {
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
  })

  const createMutation = useCreateResource(domainId)
  const updateMutation = useUpdateResource(domainId)
  const deleteMutation = useDeleteResource(domainId)

  const columns: ColumnDef<Resource>[] = [
    { accessorKey: 'Title', header: 'Title', enableSorting: true },
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
            aria-label="Delete resource"
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
        <h1 className="text-2xl font-semibold">Resources</h1>
        <Button
          onClick={() => {
            setEditingResource(null)
            createMutation.reset()
            setDrawerOpen(true)
          }}
        >
          + New Resource
        </Button>
      </div>

      <EntityTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load resources."
        total={data?.meta.total ?? 0}
        offset={offset}
        onOffsetChange={setOffset}
        pageSize={PAGE_SIZE}
        onRowDoubleClick={(resource) => {
          updateMutation.reset()
          setEditingResource(resource)
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
        title={editingResource ? 'Edit Resource' : 'New Resource'}
      >
        <ResourceFormFields
          key={editingResource?.ID ?? 'new'}
          defaultTitle={editingResource?.Title ?? ''}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          onSubmit={(title) => {
            if (editingResource) {
              updateMutation.mutate(
                { id: editingResource.ID, title },
                { onSuccess: () => setDrawerOpen(false) },
              )
            } else {
              createMutation.mutate(title, { onSuccess: () => setDrawerOpen(false) })
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

function ResourceFormFields({
  defaultTitle,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: {
  defaultTitle: string
  isSubmitting: boolean
  error?: string
  onSubmit: (title: string) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
    defaultValues: { title: defaultTitle },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d.title))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="resource-title">Title</Label>
        <Input id="resource-title" autoFocus {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
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
