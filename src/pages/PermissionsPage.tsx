import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from '@tanstack/react-router'
import type { Permission } from '@/api/types'
import { EntityTable } from '@/components/EntityTable'
import { EntityDrawer } from '@/components/EntityDrawer'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  usePermissionsQuery,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '@/hooks/usePermissions'
import { useResourcesQuery } from '@/hooks/useResources'

const PAGE_SIZE = 20

const permissionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  resourceId: z.string().min(1, 'Resource is required'),
  accessMask: z.string().min(1, 'Access mask is required'),
})
type PermissionForm = z.infer<typeof permissionSchema>

export default function PermissionsPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/permissions' })
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Permission | null>(null)

  const { data, isLoading, isError } = usePermissionsQuery(domainId, {
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
  })

  const { data: resourcesData } = useResourcesQuery(domainId, { limit: 100 })
  const resources = resourcesData?.data ?? []
  const resourceMap = Object.fromEntries(resources.map((r) => [r.ID, r.Title]))

  const createMutation = useCreatePermission(domainId)
  const updateMutation = useUpdatePermission(domainId)
  const deleteMutation = useDeletePermission(domainId)

  const columns: ColumnDef<Permission>[] = [
    { accessorKey: 'Title', header: 'Title', enableSorting: true },
    {
      accessorKey: 'ResourceID',
      header: 'Resource',
      enableSorting: false,
      cell: ({ getValue }) => {
        const id = getValue() as string
        return <span className="text-sm">{resourceMap[id] ?? id}</span>
      },
    },
    {
      accessorKey: 'AccessMask',
      header: 'Access Mask',
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
            aria-label="Delete permission"
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
        <h1 className="text-2xl font-semibold">Permissions</h1>
        <Button
          onClick={() => {
            setEditingPermission(null)
            setDrawerOpen(true)
          }}
        >
          + New Permission
        </Button>
      </div>

      <EntityTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load permissions."
        total={data?.meta.total ?? 0}
        offset={offset}
        onOffsetChange={setOffset}
        onRowDoubleClick={(perm) => {
          setEditingPermission(perm)
          setDrawerOpen(true)
        }}
        onSortChange={(s, o) => {
          setSort(s)
          setOrder(o)
        }}
        searchPlaceholder="Search permissions…"
      />

      <EntityDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingPermission ? 'Edit Permission' : 'New Permission'}
      >
        <PermissionFormFields
          key={editingPermission?.ID ?? 'new'}
          defaultValues={{
            title: editingPermission?.Title ?? '',
            resourceId: editingPermission?.ResourceID ?? '',
            accessMask: editingPermission?.AccessMask?.toString() ?? '',
          }}
          resources={resources}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          onSubmit={({ title, resourceId, accessMask }) => {
            if (editingPermission) {
              updateMutation.mutate(
                { id: editingPermission.ID, data: { title, resourceId, accessMask } },
                { onSuccess: () => setDrawerOpen(false) },
              )
            } else {
              createMutation.mutate(
                { title, resourceId, accessMask },
                { onSuccess: () => setDrawerOpen(false) },
              )
            }
          }}
          onCancel={() => setDrawerOpen(false)}
        />
      </EntityDrawer>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        entityName={deleteTarget?.Title ?? ''}
        isPending={deleteMutation.isPending}
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

function PermissionFormFields({
  defaultValues,
  resources,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: {
  defaultValues: { title: string; resourceId: string; accessMask: string }
  resources: Array<{ ID: string; Title: string }>
  isSubmitting: boolean
  error?: string
  onSubmit: (data: { title: string; resourceId: string; accessMask: string }) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PermissionForm>({
    resolver: zodResolver(permissionSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="perm-title">Title</Label>
        <Input id="perm-title" autoFocus {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="perm-resource">Resource</Label>
        <select
          id="perm-resource"
          {...register('resourceId')}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— Select resource —</option>
          {resources.map((r) => (
            <option key={r.ID} value={r.ID}>
              {r.Title}
            </option>
          ))}
        </select>
        {errors.resourceId && (
          <p className="text-xs text-destructive">{errors.resourceId.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="perm-mask">Access Mask (decimal or 0x hex)</Label>
        <Input id="perm-mask" placeholder="e.g. 7 or 0x07" {...register('accessMask')} />
        {errors.accessMask && (
          <p className="text-xs text-destructive">{errors.accessMask.message}</p>
        )}
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
