import { useState } from 'react'
import type { User } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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

/** Safely converts a decimal string to BigInt; returns 0n on invalid input. */
function safeBigInt(value: string): bigint {
  try {
    return BigInt(value)
  } catch {
    return 0n
  }
}

interface UserAccessPanelProps {
  domainId: string
  user: User
  onClose: () => void
}

export function UserAccessPanel({ domainId, user, onClose }: UserAccessPanelProps) {
  const userId = user.ID

  const {
    data: groupsData,
    isLoading: groupsLoading,
    isError: groupsError,
  } = useGroupsQuery(domainId, { limit: 100 })
  const {
    data: permissionsData,
    isLoading: permsLoading,
    isError: permsError,
  } = usePermissionsQuery(domainId, { limit: 100 })
  const {
    data: resourcesData,
    isLoading: resourcesLoading,
  } = useResourcesQuery(domainId, { limit: 100 })
  const { data: accessTypesData } = useAccessTypesQuery(domainId, { limit: 100 })
  const {
    data: authzData,
    isLoading: authzLoading,
    isError: authzError,
  } = useUserAuthzResources(domainId, userId)

  const [addGroupId, setAddGroupId] = useState('')
  const [removeGroupId, setRemoveGroupId] = useState('')
  const [grantPermId, setGrantPermId] = useState('')
  const [revokePermId, setRevokePermId] = useState('')
  const [confirmAction, setConfirmAction] = useState<{ label: string; run: () => void } | null>(null)

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

  const groupsOverflow = (groupsData?.meta.total ?? 0) > groups.length
  const permsOverflow = (permissionsData?.meta.total ?? 0) > permissions.length

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Access — {user.Title}</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-8">
            {/* Group Membership */}
            <section className="space-y-3">
              <h3 className="font-medium text-sm">Group Membership</h3>
              {groupsError && (
                <p className="text-xs text-destructive">Failed to load groups.</p>
              )}
              {groupsOverflow && (
                <p className="text-xs text-amber-600">Showing first 100 groups — some may not be listed.</p>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="add-group-select" className="text-xs">Add to group</Label>
                  <select
                    id="add-group-select"
                    value={addGroupId}
                    onChange={(e) => setAddGroupId(e.target.value)}
                    disabled={groupsLoading}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="">{groupsLoading ? 'Loading…' : '— select group —'}</option>
                    {groups.map((g) => (
                      <option key={g.ID} value={g.ID}>{g.Title}</option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  disabled={!addGroupId || addToGroup.isPending || groupsLoading}
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
                    disabled={groupsLoading}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="">{groupsLoading ? 'Loading…' : '— select group —'}</option>
                    {groups.map((g) => (
                      <option key={g.ID} value={g.ID}>{g.Title}</option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!removeGroupId || removeFromGroup.isPending || groupsLoading}
                  onClick={() => {
                    if (!removeGroupId) return
                    const label = groups.find((g) => g.ID === removeGroupId)?.Title ?? removeGroupId
                    setConfirmAction({
                      label: `Remove "${user.Title}" from group "${label}"?`,
                      run: () =>
                        removeFromGroup.mutate(
                          { userId, groupId: removeGroupId },
                          { onSuccess: () => setRemoveGroupId('') },
                        ),
                    })
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
              {permsError && (
                <p className="text-xs text-destructive">Failed to load permissions.</p>
              )}
              {permsOverflow && (
                <p className="text-xs text-amber-600">Showing first 100 permissions — some may not be listed.</p>
              )}

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="grant-perm-select" className="text-xs">Grant permission</Label>
                  <select
                    id="grant-perm-select"
                    value={grantPermId}
                    onChange={(e) => setGrantPermId(e.target.value)}
                    disabled={permsLoading}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="">{permsLoading ? 'Loading…' : '— select permission —'}</option>
                    {permissions.map((p) => (
                      <option key={p.ID} value={p.ID}>{p.Title}</option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  disabled={!grantPermId || grantPerm.isPending || permsLoading}
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
                    disabled={permsLoading}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm disabled:opacity-50"
                  >
                    <option value="">{permsLoading ? 'Loading…' : '— select permission —'}</option>
                    {permissions.map((p) => (
                      <option key={p.ID} value={p.ID}>{p.Title}</option>
                    ))}
                  </select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!revokePermId || revokePerm.isPending || permsLoading}
                  onClick={() => {
                    if (!revokePermId) return
                    const label = permissions.find((p) => p.ID === revokePermId)?.Title ?? revokePermId
                    setConfirmAction({
                      label: `Revoke permission "${label}" from "${user.Title}"?`,
                      run: () =>
                        revokePerm.mutate(
                          { userId, permissionId: revokePermId },
                          { onSuccess: () => setRevokePermId('') },
                        ),
                    })
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
              {authzError ? (
                <p className="text-xs text-destructive">Failed to load effective access data.</p>
              ) : authzLoading || resourcesLoading ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : authzResources.length === 0 ? (
                <p className="text-xs text-muted-foreground">No access grants found.</p>
              ) : (
                <>
                  {(authzData?.meta.total ?? 0) > authzResources.length && (
                    <p className="text-xs text-amber-600">Showing first 100 resources — some may not be listed.</p>
                  )}
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b">
                        <th className="text-left py-1 pr-4 font-medium">Resource</th>
                        <th className="text-left py-1 font-medium">Access Types</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authzResources.map((ar) => {
                        const mask = safeBigInt(ar.effective_mask)
                        const grantedTypes = accessTypes
                          .filter((at) => Number.isInteger(at.Bit) && at.Bit <= Number.MAX_SAFE_INTEGER && (mask & BigInt(at.Bit)) !== 0n)
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
                </>
              )}
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction?.label}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                confirmAction?.run()
                setConfirmAction(null)
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
