import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useUsersQuery, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUsers'
import { server } from '@/test/server'
import { http, HttpResponse } from 'msw'
import { TEST_API_BASE as BASE } from '@/test/constants'
import { makeQueryWrapper } from '@/test/makeQueryWrapper'

const DOMAIN_ID = 'dom-1'

describe('useUsersQuery', () => {
  let wrapper: ReturnType<typeof makeQueryWrapper>['wrapper']

  beforeEach(() => {
    wrapper = makeQueryWrapper().wrapper
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
  it('mutation resolves with new user and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCreateUser(DOMAIN_ID), { wrapper })
    result.current.mutate('Bob')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Bob')
    expect(result.current.data?.DomainID).toBe(DOMAIN_ID)
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users', DOMAIN_ID] })
  })
})

describe('useUpdateUser', () => {
  it('mutation resolves with updated user and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUpdateUser(DOMAIN_ID), { wrapper })
    result.current.mutate({ id: 'u1', title: 'Updated' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.Title).toBe('Updated')
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users', DOMAIN_ID] })
  })
})

describe('useDeleteUser', () => {
  it('mutation resolves on delete and invalidates cache', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteUser(DOMAIN_ID), { wrapper })
    result.current.mutate('u1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users', DOMAIN_ID] })
  })
})

