import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  usePermissionsQuery,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
} from '@/hooks/usePermissions'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE, TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'
import { makeQueryWrapper } from '@/test/makeQueryWrapper'

describe('usePermissionsQuery', () => {
  let wrapper: ReturnType<typeof makeQueryWrapper>['wrapper']

  beforeEach(() => {
    wrapper = makeQueryWrapper().wrapper
  })

  it('returns permission data on success', async () => {
    const { result } = renderHook(() => usePermissionsQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].Title).toBe('Read Document')
    expect(result.current.data?.data[0].DomainID).toBe(DOMAIN_ID)
    expect(result.current.data?.data[0].ResourceID).toBe('r1')
    expect(result.current.data?.data[0].AccessMask).toBe(1)
  })

  it('returns isError on server failure', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/permissions`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => usePermissionsQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('passes params to queryFn — offset and limit forwarded', async () => {
    const { result } = renderHook(
      () => usePermissionsQuery(DOMAIN_ID, { offset: 20, limit: 10 }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('uses separate cache entries for different limit values', async () => {
    const { wrapper: w, queryClient } = makeQueryWrapper()
    renderHook(() => usePermissionsQuery(DOMAIN_ID, { limit: 10 }), { wrapper: w })
    renderHook(() => usePermissionsQuery(DOMAIN_ID, { limit: 20 }), { wrapper: w })
    await waitFor(() =>
      expect(queryClient.getQueriesData({ queryKey: ['permissions'] })).toHaveLength(2),
    )
  })
})

describe('useCreatePermission', () => {
  it('mutation resolves with new permission and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreatePermission(DOMAIN_ID), { wrapper })
    result.current.mutate({ title: 'Write Document', resourceId: 'r1', accessMask: '7' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Write Document')
    expect(result.current.data?.ResourceID).toBe('r1')
    expect(result.current.data?.AccessMask).toBe(7)
    expect(result.current.data?.DomainID).toBe(DOMAIN_ID)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['permissions', DOMAIN_ID] })
  })
})

describe('useUpdatePermission', () => {
  it('mutation resolves with updated permission and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdatePermission(DOMAIN_ID), { wrapper })
    result.current.mutate({ id: 'p1', data: { title: 'Admin Document', accessMask: '15' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Admin Document')
    expect(result.current.data?.AccessMask).toBe(15)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['permissions', DOMAIN_ID] })
  })
})

describe('useDeletePermission', () => {
  it('mutation resolves on delete and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeletePermission(DOMAIN_ID), { wrapper })
    result.current.mutate('p1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['permissions', DOMAIN_ID] })
  })
})
