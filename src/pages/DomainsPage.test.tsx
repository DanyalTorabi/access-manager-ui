import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, createRootRoute, createRoute, RouterProvider } from '@tanstack/react-router'
import { createElement } from 'react'
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
})
