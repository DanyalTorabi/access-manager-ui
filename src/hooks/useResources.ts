import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi } from '@/api/resources'
import type { ListParams } from '@/api/types'

export function useResourcesQuery(domainId: string, params: ListParams = {}) {
  return useQuery({
    queryKey: ['resources', domainId, params.offset ?? 0, params.search ?? '', params.sort ?? '', params.order ?? ''],
    queryFn: () => resourcesApi.list(domainId, params),
    enabled: !!domainId,
  })
}

export function useCreateResource(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => resourcesApi.create(domainId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', domainId] }),
  })
}

export function useUpdateResource(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      resourcesApi.update(domainId, id, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', domainId] }),
  })
}

export function useDeleteResource(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resourcesApi.delete(domainId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resources', domainId] }),
  })
}
