import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import DomainsPage from '@/pages/DomainsPage'
import DomainDetailLayout from '@/pages/DomainDetailLayout'
import UsersPage from '@/pages/UsersPage'
import GroupsPage from '@/pages/GroupsPage'
import ResourcesPage from '@/pages/ResourcesPage'
import AccessTypesPage from '@/pages/AccessTypesPage'
import PermissionsPage from '@/pages/PermissionsPage'
import { RootLayout } from '@/components/RootLayout'

const rootRoute = createRootRoute({
  component: RootLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/domains' })
  },
})

const domainsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/domains',
  component: DomainsPage,
})

const domainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/domains/$domainId',
  component: DomainDetailLayout,
})

const usersRoute = createRoute({
  getParentRoute: () => domainRoute,
  path: '/users',
  component: UsersPage,
})

const groupsRoute = createRoute({
  getParentRoute: () => domainRoute,
  path: '/groups',
  component: GroupsPage,
})

const resourcesRoute = createRoute({
  getParentRoute: () => domainRoute,
  path: '/resources',
  component: ResourcesPage,
})

const accessTypesRoute = createRoute({
  getParentRoute: () => domainRoute,
  path: '/access-types',
  component: AccessTypesPage,
})

const permissionsRoute = createRoute({
  getParentRoute: () => domainRoute,
  path: '/permissions',
  component: PermissionsPage,
})

export const routeTree = rootRoute.addChildren([
  indexRoute,
  domainsRoute,
  domainRoute.addChildren([
    usersRoute,
    groupsRoute,
    resourcesRoute,
    accessTypesRoute,
    permissionsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
