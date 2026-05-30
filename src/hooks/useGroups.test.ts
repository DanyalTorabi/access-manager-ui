import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGroupsQuery, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/hooks/useGroups'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE, TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'
import { makeQueryWrapper } from '@/test/makeQueryWrapper'

describe('useGroupsQuery', () => {
  let wrapper: ReturnType<typeof makeQueryWrapper>['wrapper']

  beforeEach(() => {
    wrapper = makeQueryWrapper().wrapper
  })

  it('returns group data on success', async () => {
    const { result } = renderHook(() => useGroupsQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].Title).toBe('Admins')
    expect(result.current.data?.data[0].DomainID).toBe(DOMAIN_ID)
  })

  it('returns isError on server failure', async () => {
    server.use(
      http.get(`${BASE}/api/v1/domains/:domainId/groups`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useGroupsQuery(DOMAIN_ID), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateGroup', () => {
  it('mutation resolves with new group (no parent) and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ title: 'Editors' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Editors')
    expect(result.current.data?.ParentGroupID).toBeNull()
    expect(spy).toHaveBeenCalledWith({ queryKey: ['groups', DOMAIN_ID] })
  })

  it('mutation resolves with new group (with parent)', async () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useCreateGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ title: 'Sub-Admins', parentGroupId: 'g1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.ParentGroupID).toBe('g1')
  })
})

describe('useUpdateGroup', () => {
  it('mutation resolves with updated group and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ id: 'g1', data: { title: 'Renamed' } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Renamed')
    expect(spy).toHaveBeenCalledWith({ queryKey: ['groups', DOMAIN_ID] })
  })

  it('mutation resolves when clearing parent group', async () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useUpdateGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ id: 'g1', data: { title: 'Admins', parentGroupId: null } })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.ParentGroupID).toBeNull()
  })
})

describe('useDeleteGroup', () => {
  it('mutation resolves on delete and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteGroup(DOMAIN_ID), { wrapper })
    result.current.mutate('g1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['groups', DOMAIN_ID] })
  })
})

