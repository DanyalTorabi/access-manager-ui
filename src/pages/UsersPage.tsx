import { useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { KeyRound, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams } from '@tanstack/react-router'
import type { User } from '@/api/types'
import { EntityTable } from '@/components/EntityTable'
import { EntityDrawer } from '@/components/EntityDrawer'
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  useUsersQuery,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useUsers'
import { useGroupsQuery } from '@/hooks/useGroups'
import { usePermissionsQuery } from '@/hooks/usePermissions'
import { useResourcesQuery } from '@/hooks/useResources'
import { useAccessTypesQuery } from '@/hooks/useAccessTypes'
import {
  useAddUserToGroup,
  useRemoveUserFromGroup,
  useGrantPermissionToUser,
  useRevokePermissionFromUser,
  useUserAuthzResources,
} from '@/hooks/useGrants'

const PAGE_SIZE = 20

const userSchema = z.object({ title: z.string().min(1, 'Title is required') })
type UserForm = z.infer<typeof userSchema>

export default function UsersPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/users' })
  const [offset, setOffset] = useState(0)
  const [sort, setSort] = useState('title')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [accessPanelUser, setAccessPanelUser] = useState<User | null>(null)

  const { data, isLoading, isError } = useUsersQuery(domainId, {
    offset,
    limit: PAGE_SIZE,
    sort,
    order,
    search,
  })

  const createMutation = useCreateUser(domainId)
  const updateMutation = useUpdateUser(domainId)
  const deleteMutation = useDeleteUser(domainId)

  const columns: ColumnDef<User>[] = [
    { id: 'title', accessorKey: 'Title', header: 'Title', enableSorting: true },
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
              setAccessPanelUser(row.original)
            }}
            aria-label="Manage access"
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
            aria-label="Delete user"
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
        <h1 className="text-2xl font-semibold">Users</h1>
        <Button
          onClick={() => {
            setEditingUser(null)
            createMutation.reset()
            setDrawerOpen(true)
          }}
        >
          + New User
        </Button>
      </div>

      <EntityTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage="Failed to load users."
        total={data?.meta.total ?? 0}
        offset={offset}
        onOffsetChange={setOffset}
        pageSize={PAGE_SIZE}
        onRowDoubleClick={(user) => {
          updateMutation.reset()
          setEditingUser(user)
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
        title={editingUser ? 'Edit User' : 'New User'}
      >
        <TitleForm
          key={editingUser?.ID ?? 'new'}
          defaultTitle={editingUser?.Title ?? ''}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error?.message ?? updateMutation.error?.message}
          onSubmit={(title) => {
            if (editingUser) {
              updateMutation.mutate(
                { id: editingUser.ID, title },
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

      <UserAccessPanel
        domainId={domainId}
        user={accessPanelUser}
        onClose={() => setAccessPanelUser(null)}
      />
    </div>
  )
}

function TitleForm({
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
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { title: defaultTitle },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d.title))} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="user-title">Title</Label>
        <Input id="user-title" autoFocus {...register('title')} />
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

function UserAccessPanel({
  domainId,
  user,
  onClose,
}: {
  domainId: string
  user: User | null
  onClose: () => void
}) {
  const userId = user?.ID ?? ''

  const { data: groupsData } = useGroupsQuery(domainId, { limit: 100 })
  const { data: permissionsData } = usePermissionsQuery(domainId, { limit: 100 })
  const { data: resourcesData } = useResourcesQuery(domainId, { limit: 100 })
  const { data: accessTypesData } = useAccessTypesQuery(domainId, { limit: 100 })
  const { data: authzData, isLoading: authzLoading } = useUserAuthzResources(domainId, userId)

  const [addGroupId, setAddGroupId] = useState('')
  const [removeGroupId, setRemoveGroupId] = useState('')
  const [grantPermId, setGrantPermId] = useState('')
  const [revokePermId, setRevokePermId] = useState('')

  const addToGroup = useAddUserToGroup(domainId)
  const removeFromGroup = useRemoveUserFromGroup(domainId)
  const grantPerm = useGrantPermissionToUser(domainId)
  const revokePerm = useRevokePermissionFromUser(domainId)

  const groups = groupsData?.data ?? []
  const permissions = permissionsData?.data ?? []
  const resources = resourcesData?.data ?? []
  const accessTypes = accessTypesData?.data ?? []
  const authzResources = authzData?.data ?? []

  const resourceMap = Object.fromEntries(resources.map((r) => [r.ID, r.Title]))

  return (
    <Sheet open={!!user} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Access — {user?.Title}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Group Membership */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Group Membership</h3>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="add-group-select" className="text-xs">Add to group</Label>
                <select
                  id="add-group-select"
                  value={addGroupId}
                  onChange={(e) => setAddGroupId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">— select group —</option>
                  {groups.map((g) => (
                    <option key={g.ID} value={g.ID}>{g.Title}</option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                disabled={!addGroupId || addToGroup.isPending}
                onClick={() => {
                  if (!addGroupId) return
                  addToGroup.mutate(
                    { userId, groupId: addGroupId },
                    { onSuccess: () => setAddGroupId('') },
                  )
                }}
              >
                Add
              </Button>
            </div>
            {addToGroup.isError && (
              <p className="text-xs text-destructive">{addToGroup.error.message}</p>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="remove-group-select" className="text-xs">Remove from group</Label>
                <select
                  id="remove-group-select"
                  value={removeGroupId}
                  onChange={(e) => setRemoveGroupId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value="">— select group —</option>
                  {groups.map((g) => (
                    <option key={g.ID} value={g.ID}>{g.Title}</option>
                  ))}
                </select>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={!removeGroupId || removeFromGroup.isPending}
                onClick={() => {
                  if (!removeGroupId) return
                  removeFromGroup.mutate(
                    { userId, groupId: removeGroupId },
                    { onSuccess: () => setRemoveGroupId('') },
                  )
                }}
              >
                Remove
              </Button>
            </div>
            {removeFromGroup.isError && (
              <p className="text-xs text-destructive">{removeFromGroup.error.message}</p>
            )}
          </section>

          {/* Permission Grants */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Permission Grants</h3>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label htmlFor="grant-perm-select" className="text-xs">Grant permission</Label>
                <select
                  id="grant-perm-select"
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
                    { userId, permissionId: grantPermId },
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
                <Label htmlFor="revoke-perm-select" className="text-xs">Revoke permission</Label>
                <select
                  id="revoke-perm-select"
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
                    { userId, permissionId: revokePermId },
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

          {/* Effective Access */}
          <section className="space-y-3">
            <h3 className="font-medium text-sm">Effective Access</h3>
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
                    const mask = BigInt(ar.effective_mask)
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
