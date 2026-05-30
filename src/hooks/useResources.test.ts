import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useResourcesQuery,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from '@/hooks/useResources'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from '@/test/constants'
import { makeQueryWrapper } from '@/test/makeQueryWrapper'

const DOMAIN_ID = 'dom-1'

describe('useResourcesQuery', () => {
  let wrapper: ReturnType<typeof makeQueryWrapper>['wrapper']

  beforeEach(() => {
    wrapper = makeQueryWrapper().wrapper
  })

  it('returns resource data on success', async () => {
    const { result } = renderHook(() => useResourcesQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].Title).toBe('Document')
    expect(result.current.data?.data[0].DomainID).toBe(DOMAIN_ID)
  })

  it('returns isError on server failure', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/resources`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useResourcesQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateResource', () => {
  it('mutation resolves with new resource and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateResource(DOMAIN_ID), { wrapper })
    result.current.mutate('Invoice')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Invoice')
    expect(result.current.data?.DomainID).toBe(DOMAIN_ID)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['resources', DOMAIN_ID] })
  })
})

describe('useUpdateResource', () => {
  it('mutation resolves with updated resource and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateResource(DOMAIN_ID), { wrapper })
    result.current.mutate({ id: 'r1', title: 'Renamed' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Renamed')
    expect(spy).toHaveBeenCalledWith({ queryKey: ['resources', DOMAIN_ID] })
  })
})

describe('useDeleteResource', () => {
  it('mutation resolves on delete and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteResource(DOMAIN_ID), { wrapper })
    result.current.mutate('r1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['resources', DOMAIN_ID] })
  })
})
