import { useParams, Link } from '@tanstack/react-router'
import { Users, Layers, Package, Key, ShieldCheck, LayoutGrid } from 'lucide-react'
import { useDomainQuery } from '@/hooks/useDomains'
import { useUsersQuery } from '@/hooks/useUsers'
import { useGroupsQuery } from '@/hooks/useGroups'
import { useResourcesQuery } from '@/hooks/useResources'
import { useAccessTypesQuery } from '@/hooks/useAccessTypes'
import { usePermissionsQuery } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

type StatKey = 'users' | 'groups' | 'resources' | 'access-types' | 'permissions'

const STAT_ITEMS = [
  { label: 'Users', icon: Users, to: '/domains/$domainId/users' as const, hookKey: 'users' as const },
  { label: 'Groups', icon: Layers, to: '/domains/$domainId/groups' as const, hookKey: 'groups' as const },
  { label: 'Resources', icon: Package, to: '/domains/$domainId/resources' as const, hookKey: 'resources' as const },
  { label: 'Access Types', icon: Key, to: '/domains/$domainId/access-types' as const, hookKey: 'access-types' as const },
  { label: 'Permissions', icon: ShieldCheck, to: '/domains/$domainId/permissions' as const, hookKey: 'permissions' as const },
]

export default function DomainOverviewPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/' })
  const { data: domain, isError: domainError } = useDomainQuery(domainId)

  const users = useUsersQuery(domainId, { limit: 1 })
  const groups = useGroupsQuery(domainId, { limit: 1 })
  const resources = useResourcesQuery(domainId, { limit: 1 })
  const accessTypes = useAccessTypesQuery(domainId, { limit: 1 })
  const permissions = usePermissionsQuery(domainId, { limit: 1 })

  const stats: Record<StatKey, { isLoading: boolean; isError: boolean; count: number | undefined }> = {
    users: { isLoading: users.isLoading, isError: users.isError, count: users.data?.meta.total },
    groups: { isLoading: groups.isLoading, isError: groups.isError, count: groups.data?.meta.total },
    resources: { isLoading: resources.isLoading, isError: resources.isError, count: resources.data?.meta.total },
    'access-types': { isLoading: accessTypes.isLoading, isError: accessTypes.isError, count: accessTypes.data?.meta.total },
    permissions: { isLoading: permissions.isLoading, isError: permissions.isError, count: permissions.data?.meta.total },
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">
          {domainError ? 'Unknown domain' : (domain?.Title ?? domainId)}
        </h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_ITEMS.map(({ label, icon: Icon, to, hookKey }) => {
          const { isLoading, isError, count } = stats[hookKey]
          const display = isLoading ? '—' : isError ? '!' : (count ?? '—')
          return (
            <Link
              key={hookKey}
              to={to}
              params={{ domainId }}
              className={cn(
                'group flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-4',
                'hover:bg-accent hover:text-accent-foreground transition-colors',
              )}
            >
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
              <div>
                <p className={cn('text-2xl font-bold', isError && 'text-destructive')}>{display}</p>
                <p className="text-sm text-muted-foreground group-hover:text-accent-foreground transition-colors">{label}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
