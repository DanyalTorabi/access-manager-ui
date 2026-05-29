import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from '@tanstack/react-router'
import type { Group } from '@/api/types'
import { EntityTable } from '@/components/EntityTable'
import { EntityDrawer } from '@/components/EntityDrawer'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useGroupsQuery,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '@/hooks/useGroups'

const PAGE_SIZE = 20

const groupSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  parentGroupId: z.string().uuid('Must be a valid UUID').or(z.literal('')).optional(),
})
type GroupForm = z.infer<typeof groupSchema>

export default function GroupsPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/groups' })
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)

  const { data, isLoading, isError } = useGroupsQuery(domainId, {
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
  })

  const { data: allGroups } = useGroupsQuery(domainId, { limit: 100 })

  const createMutation = useCreateGroup(domainId)
  const updateMutation = useUpdateGroup(domainId)
  const deleteMutation = useDeleteGroup(domainId)

  const groupMap = Object.fromEntries((allGroups?.data ?? []).map((g) => [g.ID, g.Title]))

  const columns: ColumnDef<Group>[] = [
    { accessorKey: 'Title', header: 'Title', enableSorting: true },
    {
      accessorKey: 'ParentGroupID',
      header: 'Parent Group',
      enableSorting: false,
      cell: ({ getValue }) => {
        const id = getValue() as string | null | undefined
        return id ? (
          <span className="text-sm">{groupMap[id] ?? id}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )
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
            aria-label="Delete group"
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
        <h1 className="text-2xl font-semibold">Groups</h1>
        <Button
          onClick={() => {
            setEditingGroup(null)
            setDrawerOpen(true)
          }}
        >
          + New Group
        </Button>
      </div>

      <EntityTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load groups."
        total={data?.meta.total ?? 0}
        offset={offset}
        onOffsetChange={setOffset}
        pageSize={PAGE_SIZE}
        onRowDoubleClick={(group) => {
          setEditingGroup(group)
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
        title={editingGroup ? 'Edit Group' : 'New Group'}
      >
        <GroupForm
          key={editingGroup?.ID ?? 'new'}
          defaultValues={{
            title: editingGroup?.Title ?? '',
            parentGroupId: editingGroup?.ParentGroupID ?? '',
          }}
          groups={allGroups?.data ?? []}
          editingId={editingGroup?.ID}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          onSubmit={({ title, parentGroupId }) => {
            const pid = parentGroupId || null
            if (editingGroup) {
              updateMutation.mutate(
                { id: editingGroup.ID, data: { title, parentGroupId: pid } },
                { onSuccess: () => setDrawerOpen(false) },
              )
            } else {
              createMutation.mutate(
                { title, parentGroupId: pid },
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

function GroupForm({
  defaultValues,
  groups,
  editingId,
  isSubmitting,
  error,
  onSubmit,
  onCancel,
}: {
  defaultValues: { title: string; parentGroupId: string }
  groups: Group[]
  editingId?: string
  isSubmitting: boolean
  error?: string
  onSubmit: (data: { title: string; parentGroupId: string }) => void
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit({ title: d.title, parentGroupId: d.parentGroupId ?? '' }))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="group-title">Title</Label>
        <Input id="group-title" autoFocus {...register('title')} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="group-parent">Parent Group (optional)</Label>
        <select
          id="group-parent"
          {...register('parentGroupId')}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">— None —</option>
          {groups
            .filter((g) => g.ID !== editingId)
            .map((g) => (
              <option key={g.ID} value={g.ID}>
                {g.Title}
              </option>
            ))}
        </select>
        {errors.parentGroupId && (
          <p className="text-xs text-destructive">{errors.parentGroupId.message}</p>
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
