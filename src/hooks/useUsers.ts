import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/users'
import type { ListParams } from '@/api/types'

export function useUsersQuery(domainId: string, params: ListParams = {}) {
  return useQuery({
    queryKey: ['users', domainId, params.offset ?? 0, params.search ?? '', params.sort ?? '', params.order ?? ''],
    queryFn: () => usersApi.list(domainId, params),
    enabled: !!domainId,
  })
}

export function useCreateUser(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => usersApi.create(domainId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', domainId] }),
  })
}

export function useUpdateUser(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      usersApi.update(domainId, id, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', domainId] }),
  })
}

export function useDeleteUser(domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(domainId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', domainId] }),
  })
}
