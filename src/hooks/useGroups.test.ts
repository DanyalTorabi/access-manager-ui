import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useGroupsQuery, useCreateGroup, useDeleteGroup } from '@/hooks/useGroups'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from '@/test/constants'
import { makeQueryWrapper } from '@/test/makeQueryWrapper'

const DOMAIN_ID = 'dom-1'

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
  it('mutation resolves with new group (no parent)', async () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useCreateGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ title: 'Editors' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Editors')
    expect(result.current.data?.ParentGroupID).toBeNull()
  })

  it('mutation resolves with new group (with parent)', async () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useCreateGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ title: 'Sub-Admins', parentGroupId: 'g1' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.ParentGroupID).toBe('g1')
  })
})

describe('useDeleteGroup', () => {
  it('mutation resolves on delete', async () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useDeleteGroup(DOMAIN_ID), { wrapper })
    result.current.mutate('g1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})
