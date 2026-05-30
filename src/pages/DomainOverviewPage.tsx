import { useParams, Link } from '@tanstack/react-router'
import { Users, Layers, Package, Key, ShieldCheck, LayoutGrid } from 'lucide-react'
import { useDomainQuery } from '@/hooks/useDomains'
import { useUsersQuery } from '@/hooks/useUsers'
import { useGroupsQuery } from '@/hooks/useGroups'
import { useResourcesQuery } from '@/hooks/useResources'
import { useAccessTypesQuery } from '@/hooks/useAccessTypes'
import { usePermissionsQuery } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

const STAT_ITEMS = [
  { label: 'Users', icon: Users, to: '/domains/$domainId/users' as const, hookKey: 'users' },
  { label: 'Groups', icon: Layers, to: '/domains/$domainId/groups' as const, hookKey: 'groups' },
  { label: 'Resources', icon: Package, to: '/domains/$domainId/resources' as const, hookKey: 'resources' },
  { label: 'Access Types', icon: Key, to: '/domains/$domainId/access-types' as const, hookKey: 'access-types' },
  { label: 'Permissions', icon: ShieldCheck, to: '/domains/$domainId/permissions' as const, hookKey: 'permissions' },
]

export default function DomainOverviewPage() {
  const { domainId } = useParams({ from: '/domains/$domainId/' })
  const { data: domain } = useDomainQuery(domainId)

  const users = useUsersQuery(domainId, { limit: 1 })
  const groups = useGroupsQuery(domainId, { limit: 1 })
  const resources = useResourcesQuery(domainId, { limit: 1 })
  const accessTypes = useAccessTypesQuery(domainId, { limit: 1 })
  const permissions = usePermissionsQuery(domainId, { limit: 1 })

  const counts: Record<string, number | string> = {
    users: users.isLoading || users.isError ? '—' : (users.data?.meta.total ?? '—'),
    groups: groups.isLoading || groups.isError ? '—' : (groups.data?.meta.total ?? '—'),
    resources: resources.isLoading || resources.isError ? '—' : (resources.data?.meta.total ?? '—'),
    'access-types': accessTypes.isLoading || accessTypes.isError ? '—' : (accessTypes.data?.meta.total ?? '—'),
    permissions: permissions.isLoading || permissions.isError ? '—' : (permissions.data?.meta.total ?? '—'),
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{domain?.Title ?? domainId}</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {STAT_ITEMS.map(({ label, icon: Icon, to, hookKey }) => (
          <Link
            key={hookKey}
            to={to}
            params={{ domainId }}
            className={cn(
              'flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-4',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
            )}
          >
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{counts[hookKey]}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
