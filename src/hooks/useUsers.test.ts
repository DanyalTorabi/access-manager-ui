import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { useUsersQuery, useCreateUser, useDeleteUser } from '@/hooks/useUsers'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from '@/test/constants'

const DOMAIN_ID = 'dom-1'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

describe('useUsersQuery', () => {
  let wrapper: ReturnType<typeof makeWrapper>

  beforeEach(() => {
    wrapper = makeWrapper()
  })

  it('returns user data on success', async () => {
    const { result } = renderHook(() => useUsersQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].Title).toBe('Alice')
    expect(result.current.data?.data[0].DomainID).toBe(DOMAIN_ID)
  })

  it('returns isError on server failure', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/users`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useUsersQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateUser', () => {
  it('mutation resolves with new user', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useCreateUser(DOMAIN_ID), { wrapper })
    result.current.mutate('Bob')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Bob')
    expect(result.current.data?.DomainID).toBe(DOMAIN_ID)
  })
})

describe('useDeleteUser', () => {
  it('mutation resolves on delete', async () => {
    const wrapper = makeWrapper()
    const { result } = renderHook(() => useDeleteUser(DOMAIN_ID), { wrapper })
    result.current.mutate('u1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
