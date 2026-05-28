import { api } from './client'
import type { AccessType, ListParams, ListResponse } from './types'

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

export const accessTypesApi = {
  list: (domainId: string, params: ListParams = {}) =>
    api.get<ListResponse<AccessType>>(
      `/api/v1/domains/${domainId}/access-types${buildQuery(params)}`,
    ),

  get: (domainId: string, id: string) =>
    api.get<AccessType>(`/api/v1/domains/${domainId}/access-types/${id}`),

  create: (domainId: string, title: string, bit: string) =>
    api.post<AccessType>(`/api/v1/domains/${domainId}/access-types`, { title, bit }),

  update: (domainId: string, id: string, data: { title?: string; bit?: string }) =>
    api.patch<AccessType>(`/api/v1/domains/${domainId}/access-types/${id}`, data),

  delete: (domainId: string, id: string) =>
    api.delete(`/api/v1/domains/${domainId}/access-types/${id}`),
}
