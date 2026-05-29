import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { useDomainsQuery, useCreateDomain, useDeleteDomain } from '@/hooks/useDomains'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from '@/test/constants'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useDomainsQuery', () => {
  let wrapper: ReturnType<typeof makeWrapper>

  beforeEach(() => {
    wrapper = makeWrapper()
  })

  it('returns domain data on success', async () => {
    const { result } = renderHook(() => useDomainsQuery(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].Title).toBe('example.com')
  })

  it('returns isError on server failure', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useDomainsQuery(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateDomain', () => {
  it('mutation resolves with new domain', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useCreateDomain(), { wrapper })
    result.current.mutate('test.com')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('test.com')
  })
})

describe('useDeleteDomain', () => {
  it('mutation resolves on delete', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useDeleteDomain(), { wrapper })
    result.current.mutate('d1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
