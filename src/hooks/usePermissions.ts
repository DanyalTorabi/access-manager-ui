import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { permissionsApi } from '@/api/permissions'
import type { ListParams } from '@/api/types'

export function usePermissionsQuery(domainId: string, params: ListParams = {}) {
  return useQuery({
    queryKey: ['permissions', domainId, params.offset, params.limit, params.search ?? '', params.sort ?? '', params.order ?? ''],
    queryFn: () => permissionsApi.list(domainId, params),
    enabled: !!domainId,
  })
}

export function useCreatePermission(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      title,
      resourceId,
      accessMask,
    }: {
      title: string
      resourceId: string
      accessMask: string
    }) => permissionsApi.create(domainId, title, resourceId, accessMask),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions', domainId] }),
  })
}

export function useUpdatePermission(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: { title?: string; resourceId?: string; accessMask?: string }
    }) => permissionsApi.update(domainId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions', domainId] }),
  })
}

export function useDeletePermission(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => permissionsApi.delete(domainId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permissions', domainId] }),
  })
}
