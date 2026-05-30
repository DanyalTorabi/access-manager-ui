import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, createRootRoute, createRoute, RouterProvider } from '@tanstack/react-router'
import { createElement } from 'react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { TEST_API_BASE } from '@/test/constants'
import DomainsPage from '@/pages/DomainsPage'

function makeTestEnv() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const rootRoute = createRootRoute()
  const pageRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: DomainsPage })
  const router = createRouter({ routeTree: rootRoute.addChildren([pageRoute]) })
  return createElement(QueryClientProvider, { client: qc }, createElement(RouterProvider, { router }))
}

describe('DomainsPage', () => {
  it('renders the page heading', async () => {
    render(makeTestEnv())
    await waitFor(() => expect(screen.getByText('Domains')).toBeInTheDocument())
  })

  it('shows domain data from API', async () => {
    render(makeTestEnv())
    await waitFor(() => expect(screen.getByText('example.com')).toBeInTheDocument())
  })

  it('opens drawer when New Domain button is clicked', async () => {
    render(makeTestEnv())
    await waitFor(() => screen.getByText('+ New Domain'))
    fireEvent.click(screen.getByText('+ New Domain'))
    await waitFor(() => expect(screen.getByText('New Domain')).toBeInTheDocument())
  })

  it('shows delete dialog when trash button is clicked', async () => {
    render(makeTestEnv())
    await waitFor(() => screen.getByLabelText('Delete domain'))
    fireEvent.click(screen.getByLabelText('Delete domain'))
    await waitFor(() =>
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument(),
    )
  })

  it('sends ?search= query param to backend when user types in search box', async () => {
    let capturedSearch: string | null = null
    server.use(
      http.get(`${TEST_API_BASE}/api/v1/domains`, ({ request }) => {
        const url = new URL(request.url)
        const search = url.searchParams.get('search')
        if (search) capturedSearch = search
        return HttpResponse.json({
          data: [],
          meta: { total: 0, offset: 0, limit: 20, sort: 'title', order: 'asc' },
        })
      }),
    )
    render(makeTestEnv())
    await waitFor(() => expect(screen.getByRole('searchbox')).toBeInTheDocument())
    vi.useFakeTimers()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'foo' } })
    act(() => { vi.runAllTimers() })
    vi.useRealTimers()
    await waitFor(() => expect(capturedSearch).toBe('foo'))
  })
})
