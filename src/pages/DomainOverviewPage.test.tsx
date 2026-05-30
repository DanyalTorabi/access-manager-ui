import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import { createElement } from 'react'
import DomainDetailLayout from '@/pages/DomainDetailLayout'
import DomainOverviewPage from '@/pages/DomainOverviewPage'

function makeTestEnv(domainId = 'd1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const rootRoute = createRootRoute()
  const domainRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/domains/$domainId',
    component: DomainDetailLayout,
  })
  const domainIndexRoute = createRoute({
    getParentRoute: () => domainRoute,
    path: '/',
    component: DomainOverviewPage,
  })
  const history = createMemoryHistory({ initialEntries: [`/domains/${domainId}/`] })
  const router = createRouter({
    routeTree: rootRoute.addChildren([domainRoute.addChildren([domainIndexRoute])]),
    history,
  })
  return {
    qc,
    router,
    element: createElement(
      QueryClientProvider,
      { client: qc },
      createElement(RouterProvider, { router }),
    ),
  }
}

describe('DomainOverviewPage', () => {
  it('renders the domain title as a heading', async () => {
    const { element } = makeTestEnv()
    render(element)
    await waitFor(() => expect(screen.getByText('example.com')).toBeInTheDocument())
  })

  it('shows entity counts from API', async () => {
    const { element } = makeTestEnv()
    render(element)
    // MSW handlers return meta.total: 1 for all entity lists
    await waitFor(() => {
      const counts = screen.getAllByText('1')
      expect(counts.length).toBe(5)
    })
  })

  it('each stat card links to the correct sub-page', async () => {
    const { element } = makeTestEnv('d1')
    render(element)
    await waitFor(() => expect(screen.getByText('example.com')).toBeInTheDocument())

    const links = screen.getAllByRole('link')
    const hrefs = links.map((l) => l.getAttribute('href'))

    expect(hrefs).toContain('/domains/d1/users')
    expect(hrefs).toContain('/domains/d1/groups')
    expect(hrefs).toContain('/domains/d1/resources')
    expect(hrefs).toContain('/domains/d1/access-types')
    expect(hrefs).toContain('/domains/d1/permissions')
  })
})
