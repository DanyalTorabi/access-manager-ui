import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { grantsApi } from '@/api/grants'

export function useAddUserToGroup(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      grantsApi.addUserToGroup(domainId, userId, groupId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', domainId] })
      void qc.invalidateQueries({ queryKey: ['userAuthzResources', domainId] })
    },
  })
}

export function useRemoveUserFromGroup(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      grantsApi.removeUserFromGroup(domainId, userId, groupId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', domainId] })
      void qc.invalidateQueries({ queryKey: ['userAuthzResources', domainId] })
    },
  })
}

export function useGrantPermissionToUser(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, permissionId }: { userId: string; permissionId: string }) =>
      grantsApi.grantPermissionToUser(domainId, userId, permissionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', domainId] })
      void qc.invalidateQueries({ queryKey: ['userAuthzResources', domainId] })
    },
  })
}

export function useRevokePermissionFromUser(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, permissionId }: { userId: string; permissionId: string }) =>
      grantsApi.revokePermissionFromUser(domainId, userId, permissionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users', domainId] })
      void qc.invalidateQueries({ queryKey: ['userAuthzResources', domainId] })
    },
  })
}

export function useGrantPermissionToGroup(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, permissionId }: { groupId: string; permissionId: string }) =>
      grantsApi.grantPermissionToGroup(domainId, groupId, permissionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['groups', domainId] })
      void qc.invalidateQueries({ queryKey: ['groupAuthzResources', domainId] })
    },
  })
}

export function useRevokePermissionFromGroup(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ groupId, permissionId }: { groupId: string; permissionId: string }) =>
      grantsApi.revokePermissionFromGroup(domainId, groupId, permissionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['groups', domainId] })
      void qc.invalidateQueries({ queryKey: ['groupAuthzResources', domainId] })
    },
  })
}

export function useUserAuthzResources(domainId: string, userId: string) {
  return useQuery({
    queryKey: ['userAuthzResources', domainId, userId],
    queryFn: () => grantsApi.getUserAuthzResources(domainId, userId),
    enabled: !!domainId && !!userId,
  })
}

export function useGroupAuthzResources(domainId: string, groupId: string) {
  return useQuery({
    queryKey: ['groupAuthzResources', domainId, groupId],
    queryFn: () => grantsApi.getGroupAuthzResources(domainId, groupId),
    enabled: !!domainId && !!groupId,
  })
}
