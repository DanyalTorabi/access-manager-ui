import { Globe, Users, Layers, Package, Key, ShieldCheck, ChevronLeft } from 'lucide-react'
import { Link, useRouterState, useParams } from '@tanstack/react-router'
import { useDomainQuery } from '@/hooks/useDomains'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const topNavItems = [
  { to: '/domains' as const, label: 'Domains', icon: Globe },
]

const domainSubItems = [
  { path: 'users' as const, label: 'Users', icon: Users, to: '/domains/$domainId/users' as const },
  { path: 'groups' as const, label: 'Groups', icon: Layers, to: '/domains/$domainId/groups' as const },
  { path: 'resources' as const, label: 'Resources', icon: Package, to: '/domains/$domainId/resources' as const },
  { path: 'access-types' as const, label: 'Access Types', icon: Key, to: '/domains/$domainId/access-types' as const },
  { path: 'permissions' as const, label: 'Permissions', icon: ShieldCheck, to: '/domains/$domainId/permissions' as const },
]

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // Use router-aware param extraction instead of regex URL parsing.
  // Returns {} (domainId: undefined) when not on a domain-scoped route.
  const { domainId: activeDomainId } = useParams({ strict: false }) as { domainId?: string }

  const { data: domain } = useDomainQuery(activeDomainId ?? '')

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4">
        <Globe className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">Access Manager</span>
      </div>

      <Separator />

      {/* Top nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {topNavItems.map(({ to, label, icon: Icon }) => {
          const isActive = pathname === to || pathname.startsWith(to + '/')
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* Domain sub-nav */}
        {activeDomainId && (
          <>
            <div className="pt-3 pb-1">
              <Link
                to="/domains"
                className="flex items-center gap-1 px-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
                All Domains
              </Link>
              <p className="mt-1.5 px-3 text-xs font-semibold text-foreground truncate">
                {domain?.Title ?? activeDomainId}
              </p>
            </div>
            <Separator className="my-1" />
            {domainSubItems.map(({ path, label, icon: Icon, to }) => {
              const resolvedPath = `/domains/${activeDomainId}/${path}`
              const isActive = pathname === resolvedPath || pathname.startsWith(resolvedPath + '/')
              return (
                <Link
                  key={path}
                  to={to}
                  params={{ domainId: activeDomainId! }}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      <Separator />
      <div className="flex items-center justify-end px-3 py-2">
        <ThemeToggle />
      </div>
    </aside>
  )
}
