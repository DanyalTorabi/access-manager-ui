import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  createMemoryHistory,
} from '@tanstack/react-router'
import { createElement } from 'react'
import { server } from '@/test/server'
import { TEST_API_BASE } from '@/test/constants'
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
  const history = createMemoryHistory({ initialEntries: [`/domains/${domainId}`] })
  const router = createRouter({
    routeTree: rootRoute.addChildren([domainRoute.addChildren([domainIndexRoute])]),
    history,
  })
  return createElement(QueryClientProvider, { client: qc }, createElement(RouterProvider, { router }))
}

describe('DomainOverviewPage', () => {
  it('renders the domain title as a heading', async () => {
    render(makeTestEnv())
    await waitFor(() => expect(screen.getByText('example.com')).toBeInTheDocument())
  })

  it('shows entity counts from API', async () => {
    render(makeTestEnv())
    // MSW handlers return meta.total: 1 for all entity lists
    await waitFor(() => {
      const cards = screen.getAllByRole('link')
      expect(cards).toHaveLength(5)
      cards.forEach((card) => {
        expect(within(card).getByText('1')).toBeInTheDocument()
      })
    })
  })

  it('each stat card links to the correct sub-page', async () => {
    render(makeTestEnv('d1'))
    await waitFor(() => expect(screen.getByText('example.com')).toBeInTheDocument())

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
    const hrefs = links.map((l) => l.getAttribute('href'))

    expect(hrefs).toContain('/domains/d1/users')
    expect(hrefs).toContain('/domains/d1/groups')
    expect(hrefs).toContain('/domains/d1/resources')
    expect(hrefs).toContain('/domains/d1/access-types')
    expect(hrefs).toContain('/domains/d1/permissions')
  })

  it('shows ! for a stat card when the entity API returns an error', async () => {
    server.use(
      http.get(`${TEST_API_BASE}/api/v1/domains/:domainId/users`, () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    )
    render(makeTestEnv())
    // Wait for the successful cards to render their counts
    await waitFor(() => expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(4))
    // The users card should show the error indicator
    expect(screen.getByText('!')).toBeInTheDocument()
  })
})
