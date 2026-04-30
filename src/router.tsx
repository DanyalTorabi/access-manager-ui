import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import DomainsPage from '@/pages/DomainsPage'

const rootRoute = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-semibold text-sm">Access Manager</span>
          <nav className="flex gap-4 text-sm">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: 'text-foreground font-medium' }}
            >
              Domains
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DomainsPage,
})

export const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
