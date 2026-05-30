import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { domainsApi } from '@/api/domains'
import type { ListParams } from '@/api/types'

export function useDomainsQuery(params: ListParams = {}) {
  return useQuery({
    queryKey: ['domains', params.offset, params.limit, params.search ?? '', params.sort ?? '', params.order ?? ''],
    queryFn: () => domainsApi.list(params),
  })
}

/** Fetch a single domain by id. Shares the cache with DomainDetailLayout's prefetch. */
export function useDomainQuery(id: string) {
  return useQuery({
    queryKey: ['domains', id],
    queryFn: () => domainsApi.get(id),
    enabled: !!id,
    staleTime: 60_000,
  })
}

export function useCreateDomain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (title: string) => domainsApi.create(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })
}

export function useUpdateDomain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => domainsApi.update(id, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })
}

export function useDeleteDomain() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => domainsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  })
}
