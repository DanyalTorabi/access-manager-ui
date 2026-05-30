import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { KeyRound, Trash2 } from 'lucide-react'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  useGroupsQuery,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
} from '@/hooks/useGroups'
import { usePermissionsQuery } from '@/hooks/usePermissions'
import { useResourcesQuery } from '@/hooks/useResources'
import { useAccessTypesQuery } from '@/hooks/useAccessTypes'
import {
  useGrantPermissionToGroup,
  useRevokePermissionFromGroup,
  useGroupAuthzResources,
} from '@/hooks/useGrants'

const PAGE_SIZE = 20

const groupSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  parentGroupId: z.string().min(1).or(z.literal('')).optional(),
})
type GroupForm = z.infer<typeof groupSchema>

export default function GroupsPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/groups' })
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)
  const [accessPanelGroup, setAccessPanelGroup] = useState<Group | null>(null)

  const { data, isLoading, isError } = useGroupsQuery(domainId, {
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
    search,
  })

  const { data: allGroups } = useGroupsQuery(domainId, { limit: 100 })

  const createMutation = useCreateGroup(domainId)
  const updateMutation = useUpdateGroup(domainId)
  const deleteMutation = useDeleteGroup(domainId)

  const groupMap = Object.fromEntries((allGroups?.data ?? []).map((g) => [g.ID, g.Title]))

  const columns: ColumnDef<Group>[] = [
    { id: 'title', accessorKey: 'Title', header: 'Title', enableSorting: true },
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
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              setAccessPanelGroup(row.original)
            }}
            aria-label="Manage permissions"
          >
            <KeyRound className="h-4 w-4" />
          </Button>
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
            createMutation.reset()
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
          updateMutation.reset()
          setEditingGroup(group)
          setDrawerOpen(true)
        }}
        onSortChange={(s, o) => {
          setSort(s)
          setOrder(o)
        }}
        search={search}
        onSearchChange={(v) => { setSearch(v); setOffset(0) }}
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
        error={deleteMutation.error?.message}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.ID, { onSuccess: () => setDeleteTarget(null) })
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <GroupPermissionsPanel
        domainId={domainId}
        group={accessPanelGroup}
        onClose={() => setAccessPanelGroup(null)}
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

function GroupPermissionsPanel({
  domainId,
  group,
  onClose,
}: {
  domainId: string
  group: Group | null
  onClose: () => void
}) {
  const groupId = group?.ID ?? ''

  const { data: permissionsData } = usePermissionsQuery(domainId, { limit: 100 })
  const { data: resourcesData } = useResourcesQuery(domainId, { limit: 100 })
  const { data: accessTypesData } = useAccessTypesQuery(domainId, { limit: 100 })
  const { data: authzData, isLoading: authzLoading } = useGroupAuthzResources(domainId, groupId)

  const [grantPermId, setGrantPermId] = useState('')
  const [revokePermId, setRevokePermId] = useState('')

  const grantPerm = useGrantPermissionToGroup(domainId)
  const revokePerm = useRevokePermissionFromGroup(domainId)

  const permissions = permissionsData?.data ?? []
  const resources = resourcesData?.data ?? []
  const accessTypes = accessTypesData?.data ?? []
  const authzResources = authzData?.data ?? []

  const resourceMap = Object.fromEntries(resources.map((r) => [r.ID, r.Title]))

  return (
    <Sheet open={!!group} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Permissions — {group?.Title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Permission Grants */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Permission Grants</h3>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="group-grant-perm-select" className="text-xs">Grant permission</Label>
                <select
                  id="group-grant-perm-select"
                  value={grantPermId}
                  onChange={(e) => setGrantPermId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">— select permission —</option>
                  {permissions.map((p) => (
                    <option key={p.ID} value={p.ID}>{p.Title}</option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                disabled={!grantPermId || grantPerm.isPending}
                onClick={() => {
                  if (!grantPermId) return
                  grantPerm.mutate(
                    { groupId, permissionId: grantPermId },
                    { onSuccess: () => setGrantPermId('') },
                  )
                }}
              >
                Grant
              </Button>
            </div>
            {grantPerm.isError && (
              <p className="text-xs text-destructive">{grantPerm.error.message}</p>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="group-revoke-perm-select" className="text-xs">Revoke permission</Label>
                <select
                  id="group-revoke-perm-select"
                  value={revokePermId}
                  onChange={(e) => setRevokePermId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">— select permission —</option>
                  {permissions.map((p) => (
                    <option key={p.ID} value={p.ID}>{p.Title}</option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!revokePermId || revokePerm.isPending}
                onClick={() => {
                  if (!revokePermId) return
                  revokePerm.mutate(
                    { groupId, permissionId: revokePermId },
                    { onSuccess: () => setRevokePermId('') },
                  )
                }}
              >
                Revoke
              </Button>
            </div>
            {revokePerm.isError && (
              <p className="text-xs text-destructive">{revokePerm.error.message}</p>
            )}
          </section>

          {/* Access Summary */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Access Summary</h3>
            {authzLoading ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : authzResources.length === 0 ? (
              <p className="text-xs text-muted-foreground">No access grants found.</p>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b">
                    <th className="text-left py-1 pr-4 font-medium">Resource</th>
                    <th className="text-left py-1 font-medium">Access Types</th>
                  </tr>
                </thead>
                <tbody>
                  {authzResources.map((ar) => {
                    const mask = BigInt(ar.mask)
                    const grantedTypes = accessTypes
                      .filter((at) => (mask & BigInt(at.Bit)) !== 0n)
                      .map((at) => at.Title)
                    return (
                      <tr key={ar.resource_id} className="border-b last:border-0">
                        <td className="py-1.5 pr-4 text-muted-foreground">
                          {resourceMap[ar.resource_id] ?? ar.resource_id}
                        </td>
                        <td className="py-1.5">
                          {grantedTypes.length > 0
                            ? grantedTypes.join(', ')
                            : <span className="text-muted-foreground">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}
