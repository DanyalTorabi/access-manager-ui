import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import {
  useAddUserToGroup,
  useRemoveUserFromGroup,
  useGrantPermissionToUser,
  useRevokePermissionFromUser,
  useGrantPermissionToGroup,
  useRevokePermissionFromGroup,
  useUserAuthzResources,
  useGroupAuthzResources,
} from '@/hooks/useGrants'
import { TEST_DOMAIN_ID as DOMAIN_ID } from '@/test/constants'
import { makeQueryWrapper } from '@/test/makeQueryWrapper'

const USER_ID = 'u1'
const GROUP_ID = 'g1'
const PERM_ID = 'p1'

describe('useAddUserToGroup', () => {
  it('mutation resolves and invalidates users and userAuthzResources', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useAddUserToGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ userId: USER_ID, groupId: GROUP_ID })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users', DOMAIN_ID] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['userAuthzResources', DOMAIN_ID] })
  })
})

describe('useRemoveUserFromGroup', () => {
  it('mutation resolves and invalidates users and userAuthzResources', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRemoveUserFromGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ userId: USER_ID, groupId: GROUP_ID })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users', DOMAIN_ID] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['userAuthzResources', DOMAIN_ID] })
  })
})

describe('useGrantPermissionToUser', () => {
  it('mutation resolves and invalidates users and userAuthzResources', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useGrantPermissionToUser(DOMAIN_ID), { wrapper })
    result.current.mutate({ userId: USER_ID, permissionId: PERM_ID })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users', DOMAIN_ID] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['userAuthzResources', DOMAIN_ID] })
  })
})

describe('useRevokePermissionFromUser', () => {
  it('mutation resolves and invalidates users and userAuthzResources', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRevokePermissionFromUser(DOMAIN_ID), { wrapper })
    result.current.mutate({ userId: USER_ID, permissionId: PERM_ID })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['users', DOMAIN_ID] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['userAuthzResources', DOMAIN_ID] })
  })
})

describe('useGrantPermissionToGroup', () => {
  it('mutation resolves and invalidates groups and groupAuthzResources', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useGrantPermissionToGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ groupId: GROUP_ID, permissionId: PERM_ID })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['groups', DOMAIN_ID] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['groupAuthzResources', DOMAIN_ID] })
  })
})

describe('useRevokePermissionFromGroup', () => {
  it('mutation resolves and invalidates groups and groupAuthzResources', async () => {
    const { wrapper, queryClient } = makeQueryWrapper()
    const spy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useRevokePermissionFromGroup(DOMAIN_ID), { wrapper })
    result.current.mutate({ groupId: GROUP_ID, permissionId: PERM_ID })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['groups', DOMAIN_ID] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['groupAuthzResources', DOMAIN_ID] })
  })
})

describe('useUserAuthzResources', () => {
  it('returns resource list with effective_mask', async () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useUserAuthzResources(DOMAIN_ID, USER_ID), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].resource_id).toBe('r1')
    expect(result.current.data?.data[0].effective_mask).toBe('1')
  })

  it('is disabled when userId is empty', () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useUserAuthzResources(DOMAIN_ID, ''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useGroupAuthzResources', () => {
  it('returns resource list with mask', async () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useGroupAuthzResources(DOMAIN_ID, GROUP_ID), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].resource_id).toBe('r1')
    expect(result.current.data?.data[0].mask).toBe('1')
  })

  it('is disabled when groupId is empty', () => {
    const { wrapper } = makeQueryWrapper()
    const { result } = renderHook(() => useGroupAuthzResources(DOMAIN_ID, ''), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.isLoading).toBe(false)
  })
})
