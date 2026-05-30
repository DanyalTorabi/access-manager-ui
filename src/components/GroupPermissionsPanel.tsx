import { useState } from 'react'
import type { Group } from '@/api/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePermissionsQuery } from '@/hooks/usePermissions'
import { useResourcesQuery } from '@/hooks/useResources'
import { useAccessTypesQuery } from '@/hooks/useAccessTypes'
import {
  useGrantPermissionToGroup,
  useRevokePermissionFromGroup,
  useGroupAuthzResources,
} from '@/hooks/useGrants'

interface GroupPermissionsPanelProps {
  domainId: string
  group: Group | null
  onClose: () => void
}

export function GroupPermissionsPanel({ domainId, group, onClose }: GroupPermissionsPanelProps) {
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
