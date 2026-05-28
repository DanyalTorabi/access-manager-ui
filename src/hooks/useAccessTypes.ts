import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accessTypesApi } from '@/api/accessTypes'
import type { ListParams } from '@/api/types'

export function useAccessTypesQuery(domainId: string, params: ListParams = {}) {
  return useQuery({
    queryKey: ['access-types', domainId, params.offset ?? 0, params.search ?? '', params.sort ?? '', params.order ?? ''],
    queryFn: () => accessTypesApi.list(domainId, params),
    enabled: !!domainId,
  })
}

export function useCreateAccessType(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ title, bit }: { title: string; bit: string }) =>
      accessTypesApi.create(domainId, title, bit),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['access-types', domainId] }),
  })
}

export function useUpdateAccessType(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; bit?: string } }) =>
      accessTypesApi.update(domainId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['access-types', domainId] }),
  })
}

export function useDeleteAccessType(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => accessTypesApi.delete(domainId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['access-types', domainId] }),
  })
}
