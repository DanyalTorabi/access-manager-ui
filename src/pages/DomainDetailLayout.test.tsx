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

function makeTestEnv(domainId = 'd1') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const rootRoute = createRootRoute()
  const domainRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/domains/$domainId',
    component: DomainDetailLayout,
  })
  const childRoute = createRoute({
    getParentRoute: () => domainRoute,
    path: '/',
    component: () => createElement('div', null, 'child-outlet'),
  })
  const history = createMemoryHistory({ initialEntries: [`/domains/${domainId}/`] })
  const router = createRouter({
    routeTree: rootRoute.addChildren([domainRoute.addChildren([childRoute])]),
    history,
  })
  return { qc, router, element: createElement(QueryClientProvider, { client: qc }, createElement(RouterProvider, { router })) }
}

describe('DomainDetailLayout', () => {
  it('renders child outlet content', async () => {
    const { element } = makeTestEnv()
    render(element)
    await waitFor(() => expect(screen.getByText('child-outlet')).toBeInTheDocument())
  })

  it('prefetches the domain into the query cache on mount', async () => {
    const { qc, element } = makeTestEnv('d1')
    render(element)
    await waitFor(() =>
      expect(qc.getQueryData(['domains', 'd1'])).toEqual(
        expect.objectContaining({ ID: 'd1', Title: 'example.com' }),
      ),
    )
  })
})
