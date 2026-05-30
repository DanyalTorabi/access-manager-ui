import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi } from '@/api/groups'
import type { ListParams } from '@/api/types'

export function useGroupsQuery(domainId: string, params: ListParams = {}) {
  return useQuery({
    queryKey: ['groups', domainId, params.offset ?? 0, params.limit ?? 0, params.search ?? '', params.sort ?? '', params.order ?? ''],
    queryFn: () => groupsApi.list(domainId, params),
    enabled: !!domainId,
  })
}

export function useCreateGroup(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ title, parentGroupId }: { title: string; parentGroupId?: string | null }) =>
      groupsApi.create(domainId, title, parentGroupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', domainId] }),
  })
}

export function useUpdateGroup(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { title?: string; parentGroupId?: string | null }
    }) => groupsApi.update(domainId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', domainId] }),
  })
}

export function useDeleteGroup(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => groupsApi.delete(domainId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groups', domainId] }),
  })
}
