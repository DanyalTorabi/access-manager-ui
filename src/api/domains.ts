import { api } from './client'
import type { Domain, ListParams, ListResponse } from './types'

/** Shared query key for a single domain — used by DomainDetailLayout (prefetch) and Sidebar (read). */
export const domainQueryKey = (id: string) => ['domains', id] as const

function buildQuery(params: ListParams): string {
  const q = new URLSearchParams()
  if (params.offset !== undefined) q.set('offset', String(params.offset))
  if (params.limit !== undefined) q.set('limit', String(params.limit))
  if (params.search) q.set('search', params.search)
  if (params.search_type) q.set('search_type', params.search_type)
  if (params.sort) q.set('sort', params.sort)
  if (params.order) q.set('order', params.order)
  const s = q.toString()
  return s ? `?${s}` : ''
}

export const domainsApi = {
  list: (params: ListParams = {}) =>
    api.get<ListResponse<Domain>>(`/api/v1/domains${buildQuery(params)}`),

  get: (id: string) =>
    api.get<Domain>(`/api/v1/domains/${id}`),

  create: (title: string) =>
    api.post<Domain>('/api/v1/domains', { title }),

  update: (id: string, title: string) =>
    api.patch<Domain>(`/api/v1/domains/${id}`, { title }),

  delete: (id: string) =>
    api.delete(`/api/v1/domains/${id}`),
}
