import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useAccessTypesQuery,
  useCreateAccessType,
  useUpdateAccessType,
  useDeleteAccessType,
} from '@/hooks/useAccessTypes'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE, TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'
import { makeQueryWrapper } from '@/test/makeQueryWrapper'

describe('useAccessTypesQuery', () => {
  let wrapper: ReturnType<typeof makeQueryWrapper>['wrapper']

  beforeEach(() => {
    wrapper = makeQueryWrapper().wrapper
  })

  it('returns access type data on success', async () => {
    const { result } = renderHook(() => useAccessTypesQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].Title).toBe('Read')
    expect(result.current.data?.data[0].DomainID).toBe(DOMAIN_ID)
    expect(result.current.data?.data[0].Bit).toBe(1)
  })

  it('returns isError on server failure', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/access-types`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useAccessTypesQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateAccessType', () => {
  it('mutation resolves with new access type and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateAccessType(DOMAIN_ID), { wrapper })
    result.current.mutate({ title: 'Write', bit: '2' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Write')
    expect(result.current.data?.Bit).toBe(2)
    expect(result.current.data?.DomainID).toBe(DOMAIN_ID)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['access-types', DOMAIN_ID] })
  })
})

describe('useUpdateAccessType', () => {
  it('mutation resolves with updated access type and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateAccessType(DOMAIN_ID), { wrapper })
    result.current.mutate({ id: 'at1', data: { title: 'Execute', bit: '4' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Execute')
    expect(result.current.data?.Bit).toBe(4)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['access-types', DOMAIN_ID] })
  })
})

describe('useDeleteAccessType', () => {
  it('mutation resolves on delete and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteAccessType(DOMAIN_ID), { wrapper })
    result.current.mutate('at1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['access-types', DOMAIN_ID] })
  })
})
